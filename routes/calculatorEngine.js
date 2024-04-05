const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated.js");
const fs = require("fs");
const regression = require("regression");

function initCalculatorEngineRoutes(db) {
  const app = express.Router()
  function isString(input) {
    return typeof input === 'string' && Object.prototype.toString.call(input) === '[object String]'
  }
  const idealNumberOfSkinDataset = 600
  const checkLiquidParameter = (volume, concentration, dilutionFactor, density, solvant) => {

    if (volume === undefined || volume === '' || isNaN(parseFloat(volume)) || volume === 0) volume = 20
    if (solvant === undefined || solvant === '' || isNaN(parseFloat(solvant))) solvant = 0
    if (concentration === undefined || concentration === '' || isNaN(parseFloat(concentration))) concentration = 1

    if (isString(volume)) volume = parseFloat(volume.replace(',', '.'))
    if (isString(concentration)) concentration = parseFloat(concentration.replace(',', '.'))
    if (isString(dilutionFactor)) dilutionFactor = parseFloat(dilutionFactor.replace(',', '.'))
    if (isString(density)) density = parseFloat(density.replace(',', '.'))
    if (isString(solvant)) solvant = parseFloat(solvant.replace(',', '.'))

    return { volume: volume, concentration: concentration, dilutionFactor: dilutionFactor, density: density, solvant: solvant }
  }
  //Permet de mettre en place le nombre minimal de valeur en fonction du type de mesure (Liquid/Skin)
  const checkTypeForNumberOfData = (type) => {
    if (type.includes('skin')) {
      console.log("Nombre minimal de donnee : \x1b[31m 15 \x1b[0m, Skin");
      return 40
    }
    if (type.includes('liquid')) {
      console.log("Nombre minimal de donnee : \x1b[31m 40 \x1b[0m, Liquid");
      return 40
    }
    console.log("!!! Problème de type, le nombre de mesure a été mis a 27 !!!");
    return 27
  }
  // Supprime les points défectueux ou qui sont trop éloigné des autres si CV > 30 pour les 5 derniers points actuels
  const filterData = (data, separator) => {
    const isNumeric = (str) => {
      const num = parseFloat(str.replace(",", "."));
      return !isNaN(num);
    };
    // data = data.filter((item) => item !== undefined && item !== "" && item !== null && item !== 'null' && !isNaN(item.split(';')[1]))
    // data = data.map(item => item.replace(",", "."))
    console.log("Before : ");
    console.log(data);
    data = data.split(separator).map(line => line.split(";"))  // Diviser chaque ligne par ;
      .filter(parts => parts.length === 2)  // Ignorer les lignes mal formées
      .map(parts => parts[1].trim())  // Prendre la deuxième valeur et retirer les espaces en trop
      .filter(isNumeric)  // Filtrer les valeurs numériques
      .map(value => parseFloat(value.replace(",", ".")));  // Convertir en nombre à virgule flottante



    // Partie pour enlever les données qui sont trop éloignées de la moyenne grace a la moyenne des 5 derniers points
    for (let i = data.length - 1; i >= 0; i--) {
      var item = data[i]
      if (Number(item) <= -2000) {
        data.splice(i, 1)
      }
      // if (i < data.length - 5 && i > 5) {
      //   var lastFivePoint = data
      //   lastFivePoint = lastFivePoint.slice(i, i + 5)
      //   let moyenne = lastFivePoint.reduce((acc, curr) => {
      //     return Number(acc) + Number(curr)
      //   }, 0) / lastFivePoint.length;
      //   let ecartType = getStanderedDeviation(lastFivePoint)
      //   if (ecartType !== undefined) {
      //     var cv = ((ecartType / moyenne) * 100).toFixed(2)
      //     if (Number(cv) >= 30) {
      //       console.log(lastFivePoint);
      //       console.log('', i, ' ', cv, ' ', item);

      //       data.splice(i, 1)
      //     }
      //   }
      // }
    }
    console.log({ l: data.length, data });
    return data
  }
  // Calcule Vinitiale, Vfinale, VMin, VMax
  function getVInitVFinVMinVMaxV3(data, T1, T2, T3, type) {
    var Vinitiale = 0
    var VFinale = 0
    var VMin = Number.MAX_SAFE_INTEGER // VMin est la moyenne la plus basse de 5 valeurs
    var VMax = Number.MIN_SAFE_INTEGER

    // Les valeurs du tableau ont déjà été trié et vérifié donc les données sont sures
    const T1Data = data.slice(0, Number(T1))
    const T2Data = data.slice(Number(T1), Number(T1) + Number(T2))
    const T3Data = data.slice(Number(T1) + Number(T2), Number(T1) + Number(T2) + Number(T3))
    // On calcule VInitiale
    if (type === 'skin') Vinitiale = parseFloat((parseFloat(data[8]) + parseFloat(data[9])) / 2) // Skin :  On prend la moyenne des valeurs 9 et 10
    else Vinitiale = T1Data.slice(-10).reduce((acc, val) => parseFloat(acc) + parseFloat(val), 0) / 10; // Liquid : On prend la moyenne des 10 dernieres valeurs de T1

    // On calcule VMin et VMax
    data.map((row, i) => {
      row = parseFloat(row)
      if (row > VMax) VMax = Number(row)
      // if (row < VMin) VMin = Number(row)
      if (i >= 5 + Number(T1)) {
        let tmp = data.slice(i - 5, i).reduce((acc, val) => parseFloat(acc) + parseFloat(val), 0) / 5
        if (tmp < VMin) VMin = Number(tmp)
      }
    })
    // console.log({ 1: T1Data.length, 2: T2Data.length, 3: T3Data.length });
    // On calcule VFinale avec les 40 dernières valeurs de T3
    VFinale = T3Data.slice(-40)
    let VFinaleLength = VFinale.length === 0 ? 1 : VFinale.length
    VFinale = VFinale.reduce((acc, val) => parseFloat(acc) + parseFloat(val), 0);
    VFinale = parseFloat(VFinale) / parseFloat(VFinaleLength)

    return [Vinitiale, VFinale, VMin, VMax]
  }
  // Normalise une valeur en fonction du volume recommandé.
  const normalizeToGoodVolume = (value, volume, recommendedVolume) => {
    try {
      // Vérifier si les arguments sont des nombres valides et non nuls
      if (isNaN(value) || isNaN(volume) || volume === 0 || isNaN(recommendedVolume) || recommendedVolume === 0) {
        console.log('Fail to normalize: value', value, 'volume:', volume, 'recommended volume:', recommendedVolume);
        return value;
      }
      console.log('Normalize: value', value, 'volume on tablet:', volume, 'recommended volume from method:', recommendedVolume);
      // Calculer le résultat en multipliant la valeur par le rapport des volumes
      const result = (Number(value) / volume) * Number(recommendedVolume);
      console.log(`( ${value} / ${volume} ) * ${recommendedVolume}`);
      console.log('New value', result);
      // Arrondir le résultat à 4 décimales et le convertir en nombre
      return Number(result.toFixed(10));
    } catch (error) {
      // En cas d'erreur, retourner la valeur initiale
      return value;
    }
  }
  const chooseHowToCalculV2 = (goal, Vinitiale, Vfinale, Vmin, Vmax, paot1, paot2, pot1, pot2, mixtePaot1, mixtePaot2, mixtePot1, mixtePot2) => {
    const getValue = (key) => {
      switch (key) {
        case "Vfinale":
          return Vfinale;
        case "Vinitiale":
          return Vinitiale;
        case "Vmin":
          return Vmin;
        case "Vmax":
          return Vmax;
        default:
          return undefined;
      }
    };
    let string1, string2, string3, string4;
    if (goal === 'paot') {
      string1 = paot1;
      string2 = paot2;
    } else if (goal === 'pot') {
      string1 = pot1;
      string2 = pot2;
    } else if (goal === 'mixte') {
      string1 = mixtePaot1;
      string2 = mixtePaot2;
      string3 = mixtePot1;
      string4 = mixtePot2;
    }
    const a = getValue(string1);
    const b = getValue(string2);
    const c = getValue(string3);
    const d = getValue(string4);
    return [Math.abs(a - b), Math.abs(c - d)];
  };
  function calculPaotLiquidSerum(value, idMethod, C, D, F, X, Y, Z, E) {
    let haut = ((1 - Math.pow(10, -value / E)) * X)
    let bas = 2 * (1 + ((X * Math.pow(10, -value / E)) / Y))
    let res = (haut / bas) * ((Z * D * F) / C)
    ////console.log(`v ${value} id ${idMethod} C ${C} D ${F} F ${X} Y ${Y} Z ${Z} E ${E}`)
    ////console.log(`Resultat PAOT SEMI-FINAL LIQUID SERUM  ${res}`)
    return res
  }
  function calculPaotLiquidFood(value, idMethod, C, D, F, X, Y, Z, E) {
    let haut = ((1 - Math.pow(10, -value / E)) * X)
    let bas = 2 * (1 + ((X * Math.pow(10, -value / E)) / Y))
    let res = (haut / bas) * ((Z * D * F) / C)
    ////console.log(`v ${value} id ${idMethod} C ${C} D ${F} F ${X} Y ${Y} Z ${Z} E ${E}`)
    return res
    ////console.log(`Resultat PAOT SEMI-FINAL LIQUID FOOD  ${res}`)
  }

  function calculPotLiquid(value, idMethod, C, D, F, X, Y, Z, E) {
    let haut = 0.5 * (Math.pow(10, -value / E) - 1) * X
    let bas = 1 + (X * Math.pow(10, -value / E) / Y)
    let res = (haut / bas) * ((Z * D * F) / C)
    ////console.log(`(${haut} / ${bas}) * ((${Z} * ${D} * ${F}) / ${C})`);
    ////console.log(`v ${value} id ${idMethod} C ${C} D ${F} F ${X} Y ${Y} Z ${Z} E ${E}`)
    ////console.log(`Resultat POT SEMI-FINAL LIQUID ${res}`)
    return res
  }
  function calculPaotSkin(value, idMethod, X, Y, Z, E) {
    let haut = ((1 - Math.pow(10, -value / E)) * X)
    let bas = 1 + ((X / Y) * Math.pow(10, -value / E))
    let res = (haut / bas) * Z
    ////console.log(`v ${value} id ${idMethod} ${X} Y ${Y} Z ${Z} E ${E}`)
    return res
    ////console.log(`Resultat PAOT SEMI-FINAL SKIN  ${res}`)
  }
  function calculPotSkin(value, idMethod, X, Y, Z, E) {
    let haut = ((-1 + Math.pow(10, -value / E)) * X)
    let bas = 1 + ((X / Y) * Math.pow(10, -value / E))
    let res = (haut / bas) * Z
    ////console.log(`v ${value} id ${idMethod} haut ${haut} bas ${bas} X ${X} Y ${Y} Z ${Z} E ${E}`)
    ////console.log(`v ${value} id ${idMethod} C ${C} D ${F} F ${X} Y ${Y} Z ${Z} E ${E}`)
    return res
    ////console.log(`Resultat POT SEMI-FINAL SKIN  ${res}`)
  }
  // Try to correct value when dataset is too short ( Pour faire des mesures de 3 minutes au lieu de 10 minutes)
  const correctValueForShorterDataset = (value, pointNumber, coef) => {
    if (isNaN(value) || value === undefined || pointNumber === undefined || isNaN(pointNumber)) { return undefined }
    if (pointNumber > 240) coef = 1
    //return ((value * idealNumberOfSkinDataset) / pointNumber) * coef
    console.log('nb point : ', pointNumber);
    console.log('coef : ', coef);
    return value * coef
  }
  const calculateCorrectionFactor = (preAnalysisValue) => {
    // if (preAnalysisValue < 0.65 || preAnalysisValue > 1.35) {
    //   throw new Error("Invalid pre-analysis value. It must be between 0.65 and 1.35.");
    // }
    return 1 / preAnalysisValue;
  };
  // Fonctionnel
  function paramCalculatorV2(formule, params, score, paot, pot, sso, deviationCoef, concentration) {
    try {
      params = JSON.parse(params)
      params.map((row) => { // Remplacer les lettres par la valeur dans la formule
        let name = row[0]
        let value = row[1]
        let myregex = new RegExp(name, 'g')
        formule = formule.replace(myregex, value)
      })
    } catch (error) {
      console.log("Erreur param");
    }
    // On assigne la valeur de X dans le parser
    if (score === 'paot') formule = formule.replace(new RegExp("x", 'g'), paot)
    if (score === 'pot') formule = formule.replace(new RegExp("x", 'g'), pot)
    if (score === 'rso') formule = formule.replace(new RegExp("x", 'g'), rso)
    if (score === 'sso') formule = formule.replace(new RegExp("x", 'g'), sso)
    if (score === 'mixte') formule.replace(new RegExp('x', 'g'), paot / 2 + pot / 2)

    if (concentration === 1) { // PAS ENCORE APPLIUQUER
      formule = formule.replace(new RegExp("solvant", 'g'), 0)
    } else {
      formule = formule.replace(new RegExp("solvant", 'g'), 0.035)
    }
    // formule = formule.replace(/\^/g, '**')
    // console.log(formule);

    formule = formule.replace(/\^/g, '**');
    try {
      return { value: eval(formule), formule: formule }
    }
    catch (err) {
      console.log(err)
    }
  }
  async function consoleAndLog(filePath, message) {
    return await new Promise(async (resolve, reject) => {

      fs.appendFileSync(filePath, '\n' + message, () => { });
      // console.log(message)
      resolve()
    })
  }
  const getSeparator = (data) => {
    //console.log(data);
    var separator = undefined
    if (data.includes('\r\n')) separator = '\r\n'
    else if (data.includes('\n')) separator = '\n'
    return separator
  }
  // Calculate the PAOT/POT/Parameters
  app.post('/analyse/:id/calculate', isAuthenticated, async (req, res) => {

    var isRealMeasure
    // Mandatory for calculate a real measure 
    var IDGroupMeasure = req.params.id
    var { IDGroupMethod: IDGroupParameter, Score: typeCalcul, deviationCoef, IDMethod } = req.body;// ID de la mesure
    // ID du groupe de parametre
    // Paot / Pot ou Mixte
    // Skin // Useless , saved during creation of measure group
    // const weight = req.body.weight
    // const size = req.body.size
    // const age = req.body.Age

    if (deviationCoef === undefined || deviationCoef === null || isNaN(deviationCoef) || deviationCoef < 0.65 || deviationCoef > 1.35) deviationCoef = 1
    // + for a Onfly calcul    
    console.log(req.body.IDMethod);
    var allData = req.body.Measures
    const hasMeasure = allData !== null && allData !== undefined && allData !== "" ? true : false // Si il y a un jeux de donnée
    const hasVinit = req.body.Vinitiale !== null && req.body.Vinitiale !== undefined && req.body.Vinitiale !== "" ? true : false // Si on a une valeur initiale
    const hasVfinal = req.body.Vfinale != null && req.body.Vfinale !== undefined && req.body.Vfinale != "" ? true : false // Si on a une valeur finale
    console.log(req.body)
    const { volume, concentration, dilutionFactor, density, solvant } = checkLiquidParameter(req.body.Volume, req.body.C, req.body.F, req.body.D, req.body.Solvant)
    // const { volume, concentration, dilutionFactor, density, solvant } = { volume: 50, concentration: 20, dilutionFactor: 1, density: 1, solvant: 0 }
    // req.body.Volume = volume

    if (!IDGroupMeasure && IDMethod && hasMeasure && typeCalcul) isRealMeasure = false
    else if (IDGroupMeasure && typeCalcul) isRealMeasure = true
    if (isRealMeasure === undefined) {
      if (!IDGroupMeasure) { console.log("ID du groupe de mesure manquant IDGroupMeasure"); res.status(500).send({ message: "ID du groupe de mesure manquant IDGroupMeasure" }) }
      else if (!IDMethod) { console.log("ID de méthode manquant pour mesure OnFly"); res.status(500).send({ message: 'ID de la méthode manquant pour mesure OnFly' }) }
      else if (!typeCalcul) { console.log("Type de calcul manquant (Paot ou Pot ou Mixte)"); res.status(500).send({ message: 'Type de calcul manquant (Paot ou Pot ou Mixte)' }) }
      else if (!hasMeasure) { console.log("Valeur de mesure manquantes"); res.status(500).send({ message: 'Valeur de mesure manquantes' }) }
      else if (!req.body.Type) { console.log('But de calcul manquant (Skin ou liquid-food ou liquid-serum)'); res.status(500).send({ message: 'But de calcul manquant (Skin ou liquid-food ou liquid-serum)' }) }
      return
    }
    var headerFile = 'OnFly_'
    // Verifie si il peut payer avec les coins
    var datasetID = []
    if (isRealMeasure) {// Recupère les jeu de données si c'est une vrai mesure
      headerFile = 'Real_' + IDGroupMeasure + '_'

      console.log('\n --- \x1b[32m Vrai mesure \x1b[0m--- \n');
      let result = await db.query(`SELECT md.id,md.data,mg.Method_IDMethod,mg.Device_IDDevice FROM measures_group mg INNER JOIN measures_data md ON md.measures_groupID=mg.id WHERE mg.id = ?`, [IDGroupMeasure])
        .then(async result => result)
        .catch(async err => undefined)
      if (result === undefined || result.length <= 0) { res.status(500).send({ message: 'You need to add data to calcul a score' }); return '' }
      IDMethod = result[0].Method_IDMethod;
      allData = result.map(row => row.data)
      datasetID = result.map(row => row.id)
      console.log(datasetID);
    } else {
      console.log('\n --- \x1b[32m Mesure a la volee \x1b[0m--- \n');
      allData = allData.split('@')
    }
    var dateString = new Date()
    let year = dateString.getFullYear();
    let month = ("0" + (dateString.getMonth() + 1)).slice(-2);
    let day = ("0" + dateString.getDate()).slice(-2);
    let hour = dateString.getHours();
    let minute = dateString.getMinutes();
    let seconds = dateString.getSeconds();
    const filePath = 'logs/' + headerFile + '_' + year + '-' + day + '-' + month + '-' + '_' + hour + ":" + minute + ":" + seconds + '_' + new Date().getTime().toString()
    // const filePath = 'logs/' + Math.random() * 10000
    console.log(filePath);

    if (isRealMeasure) {
      fs.appendFileSync(filePath, '=== ANALYSE LOG ===\nReal measure ID: ' + IDGroupMeasure, () => { })
    } else {
      fs.appendFileSync(filePath, '=== ANALYSE LOG ===\nOnFly measure: NO ID', () => { })
    }
    consoleAndLog(filePath, `Timestamp: ${new Date().toISOString().replace('T', ' ').replace('Z', '')}\n`)
    consoleAndLog(filePath, 'Method: ' + IDMethod);
    if (!IDGroupParameter || isNaN(IDGroupParameter)) { // On recupère le groupe de paramètre
      let result = await db.query('SELECT id FROM `method_groupparameter` WHERE method_ID=?', [IDMethod])
        .then(result => {
          if (result.length > 0) return result[0].id
          return undefined
        })
        .catch(err => { console.log(err); return undefined })
      if (result === undefined) { console.log('Error in fetch of group parameter'); res.status(500).send({ message: 'Error in fetch of group parameter' }); return }
      IDGroupParameter = result
    }

    // Recupérer  la facon de calculé et le format de la methode (Liquid/Skin)
    let result = await db.query("SELECT t.name as Type,method.TypeID,Volume,method.Algo,method.Variable,scoreFormPaotXPaot,scoreFormPaotXPot,scoreFormMixteXPaot,scoreFormMixteXPot FROM method INNER JOIN type t ON t.id = method.TypeID WHERE IDMethod=?;", [IDMethod])
      .then(result => result)
      .catch(err => undefined)
    if (result === undefined) { consoleAndLog(filePath, '=== ERROR === Error in fetch of method coef '); res.status(500).send({ message: 'Error in fetch of method coef' }); return }
    if (isRealMeasure === false && ((typeCalcul === 'paot' && (result[0].scoreFormPaotXPaot === undefined || result[0].scoreFormPaotXPaot.length <= 4)) || (typeCalcul === 'pot' && (result[0].scoreFormPaotXPot === undefined || result[0].scoreFormPaotXPot.length <= 4)) || (typeCalcul === 'mixte' && (result[0].scoreFormMixteXPaot === undefined || result[0].scoreFormMixteXPaot.length <= 4 || result[0].scoreFormMixteXPot === undefined || result[0].scoreFormMixteXPot.length <= 4)))) { consoleAndLog(filePath, 'How to calcul paot,pot or mixte in method are not correct '); res.status(500).send({ message: 'How to calcul paot,pot or mixte in method are not correct ' }); return undefined }
    const { Type: LiquidOrSkin, scoreFormPaotXPot: formXPOT, scoreFormPaotXPaot: formXPAOT, scoreFormMixteXPaot: formXMixtePAOT, scoreFormMixteXPot: formXMixtePOT, Volume: recommendedVolume } = result[0];
    var T1 = Number(JSON.parse(result[0].Algo).t1duration)
    var T2 = Number(JSON.parse(result[0].Algo).t2duration)
    var T3 = Number(JSON.parse(result[0].Algo).t3duration)
    console.log({ T1, T2, T3 });

    var isVariable = result[0].Variable !== 0
    consoleAndLog(filePath, 'Type: ' + LiquidOrSkin);
    if (T3 === 0 && isVariable === false) { consoleAndLog(filePath, '=== ERROR === Invalid T3 method duration'); res.status(500).send({ message: 'Invalid T3 method duration' }); return }
    var deltaPaot = []
    var deltaPot = []
    var equationArray = []
    var dataLength = []
    var minNumberOfDataAllowed = checkTypeForNumberOfData(LiquidOrSkin)
    // Boucle par jeu de donnée

    console.log('==== AVANT LA BOUCLE ====');
    allData.map(async (data, i) => {
      console.log('IN THE BOUCLE');
      consoleAndLog(filePath, '\n   -- Data ' + (i + 1) + '\n');
      console.log('the boulcle');
      const separator = getSeparator(data)
      if (separator === undefined) return
      const rawData = JSON.stringify(data.split(separator)) // Saved for log
      data = filterData(data, separator) // Filtre les données
      // Check if data is long enough after filtered
      if (data.length < minNumberOfDataAllowed * 2) { console.log('This dataset is too short'); consoleAndLog(filePath, '     This data set is too short for being exploited'); return }
      try {
        const dataForEquation = data.map((row, i) => [i, Number(row)])
        let result = regression.polynomial(dataForEquation, { order: 3, precision: 10 });
        // console.log(result.equation);
        const equation = { a: Number(result.equation[0]), b: Number(result.equation[1]), c: Number(result.equation[2]), d: Number(result.equation[3]), r2: Number(result.r2) }
        consoleAndLog(filePath, `\n Equation ${JSON.stringify(equation)}`);
        equationArray.push(equation)
      } catch (error) {
        console.log("🚀 ~ file: ScoreCalculator.js:1173 ~ allData.map ~ error:", error)
        equationArray.push({ a: undefined, b: undefined, c: undefined, d: undefined, r2: undefined })
      }
      console.log('the boucle 2');

      var [VInitiale, VFinale, VMin, VMax] = getVInitVFinVMinVMaxV3([...data], T1, T2, T3, LiquidOrSkin)
      console.log({ VInitiale, VFinale, VMin, VMax });
      if (hasVinit) VInitiale = req.body.Vinitiale
      if (hasVfinal) VFinale = req.body.Vfinale

      consoleAndLog(filePath, `     Vinitiale ${VInitiale}`)
      consoleAndLog(filePath, `     Vfinale ${VFinale}`)
      consoleAndLog(filePath, `     VMin ${VMin}`)
      consoleAndLog(filePath, `     VMax  ${VMax}`)
      let deltaArray = chooseHowToCalculV2(typeCalcul, VInitiale, VFinale, VMin, VMax, formXPAOT.split("-")[0], formXPAOT.split("-")[1], formXPOT.split("-")[0], formXPOT.split("-")[1], formXMixtePAOT.split("-")[0], formXMixtePAOT.split("-")[1], formXMixtePOT.split("-")[0], formXMixtePOT.split("-")[1])
      console.log("🚀 ~ file: ScoreCalculator.js:1188 ~ allData.map ~ deltaArray:", deltaArray)
      consoleAndLog(filePath, '     deltaBrut : ' + deltaArray);
      if (LiquidOrSkin.includes('liquid')) {
        console.log('deltaPaot if corrected : ', normalizeToGoodVolume(deltaArray[0], volume, recommendedVolume))
        console.log('deltaPot if corrected : ', normalizeToGoodVolume(deltaArray[1], volume, recommendedVolume))
      }

      if (deltaArray === undefined) { return }
      if (typeCalcul == "paot") { // Calcul du delta PAOT
        deltaPaot.push(deltaArray[0])
        deltaPot.push(null)
      } else if (typeCalcul == "pot") { // Calcul du delta POT
        deltaPaot.push(null)
        deltaPot.push(deltaArray[0])
      } else if (typeCalcul == "mixte") { // Calcul du delta PAOT & POT
        deltaPaot.push(deltaArray[0])
        deltaPot.push(deltaArray[1])
      }
      console.log("🚀 ~ file: ScoreCalculator.js:1238 ~ app.post ~ deltaPaot:", deltaPaot)
      dataLength.push(data.length)
      consoleAndLog(filePath, '     Nombre de points : ' + data.length);
      consoleAndLog(filePath, '     Jeu de données brut: ' + rawData);
      consoleAndLog(filePath, '     Jeu de données traité: ' + data);
      consoleAndLog(filePath, '   --- --- ---');
    })
    console.log('==== APRES LA BOUCLE ====');

    // Recuperer coef de la methode
    result = await db.query("SELECT C1,C2,C3,C4,Name FROM coefficient WHERE Method_IDMethod=?", [IDMethod])
      .then(result => result)
      .catch(err => undefined)
    if (result === undefined) { consoleAndLog(filePath, '=== ERROR === Error in fetch of coefficient of method'); res.status(500).send({ message: 'Error in fetch of coefficient method' }); return }
    var Xpaot = result[0].C1
    var Ypaot = result[0].C2
    var Zpaot = result[0].C3
    var Epaot = result[0].C4
    var Xpot = result[1].C1
    var Ypot = result[1].C2
    var Zpot = result[1].C3
    var Epot = result[1].C4
    var paotPreFinal = []
    var potPreFinal = []
    // Calculer les resultats finaux
    var coef = 1


    console.log("🚀 ~ file: ScoreCalculator.js:1231 ~ app.post ~ deltaPaot:", deltaPaot)
    deltaPaot.map(delta => {
      if (Number(delta) < 18) {
        coef = 2
      }
      console.log({ LiquidOrSkin, paotPreFinal, delta, IDMethod, concentration, density, dilutionFactor, Xpaot, Ypaot, Zpaot, Epaot })
      // console.log({ delta, IDMethod, Xpaot, Ypaot, Zpaot, Epaot });
      if (LiquidOrSkin === "skin") paotPreFinal.push(calculPaotSkin(delta, IDMethod, Xpaot, Ypaot, Zpaot, Epaot))
      if (LiquidOrSkin === "liquid-serum") paotPreFinal.push(calculPaotLiquidSerum(delta, IDMethod, concentration, density, dilutionFactor, Xpaot, Ypaot, Zpaot, Epaot))
      if (LiquidOrSkin === "liquid-food") paotPreFinal.push(calculPaotLiquidFood(delta, IDMethod, concentration, density, dilutionFactor, Xpaot, Ypaot, Zpaot, Epaot))
    })
    deltaPot.map(delta => {
      if (LiquidOrSkin === "skin") potPreFinal.push(calculPotSkin(delta, IDMethod, Xpot, Ypot, Zpot, Epot))
      if (LiquidOrSkin.includes("liquid")) potPreFinal.push(calculPotLiquid(delta, IDMethod, concentration, density, dilutionFactor, Xpot, Ypot, Zpot, Epot))
    })
    console.log("🚀 ~ file: ScoreCalculator.js:1246 ~ app.post ~ deltaPaot:", deltaPaot)

    consoleAndLog(filePath, 'deltaPaot : ' + deltaPaot);
    consoleAndLog(filePath, 'deltaPot : ' + deltaPot + '\n');
    // SKIN FIXE CORRIGE SUR T3 / T3Ideal : 600
    // On corrige si la mesure a duré moins de T3 or est variable et s'est arrete avant QUE PAOT
    if (LiquidOrSkin === 'skin') {
      if (isVariable) {
        paotPreFinal.map(async (row, i) => {
          paotPreFinal[i] = correctValueForShorterDataset(row, dataLength[i], coef)
          consoleAndLog(filePath, `('Correction PAOT/Duree : ${row} --> ${paotPreFinal[i]} (Paot * ', ${idealNumberOfSkinDataset}) / ${dataLength[i]})`);

        })
        potPreFinal.map(async (row, i) => {
          potPreFinal[i] = correctValueForShorterDataset(row, dataLength[i], coef)
          consoleAndLog(filePath, `('Correction POT/Duree : ${row} --> ${potPreFinal[i]} (Pot * ', ${idealNumberOfSkinDataset}) / ${dataLength[i]})`);
        })
      } else {
        paotPreFinal.map(async (row, i) => {
          paotPreFinal[i] = correctValueForShorterDataset(row, dataLength[i], coef)
          consoleAndLog(filePath, `('Correction PAOT/Duree : ${row} --> ${paotPreFinal[i]} (Paot * ', ${idealNumberOfSkinDataset}) / ${dataLength[i]})`);
        })
        potPreFinal.map(async (row, i) => {
          potPreFinal[i] = correctValueForShorterDataset(row, dataLength[i], coef)
          consoleAndLog(filePath, `('Correction POT/Duree : ${row} --> ${potPreFinal[i]} (Pot * ', ${idealNumberOfSkinDataset}) / ${dataLength[i]})`);
        })
      }
    }
    // Faire la moyenne
    console.log({ paotPreFinal })
    var myPaot = paotPreFinal.reduce((tampon, value) => Number(tampon) + Number(value), 0) / paotPreFinal.length
    var myPot = potPreFinal.reduce((tampon, value) => Number(tampon) + Number(value), 0) / potPreFinal.length
    var mySso = 100 - (myPot - myPaot)
    if (myPot < 0) myPot = myPot * -1
    if (myPaot === null || isNaN(myPaot) || myPaot === undefined) myPaot = 0
    if (myPot === null || isNaN(myPaot) || myPot === undefined) myPot = 0

    const correctionFactor = calculateCorrectionFactor(deviationCoef)
    console.log({ correctionFactor });

    // Faire l'objet des resume Paot/Pot
    console.log({ paotPreFinal });
    var datasetValues = paotPreFinal.map((row, i) => {
      if (LiquidOrSkin !== 'skin') {
        var ownPaot = normalizeToGoodVolume(row, volume, recommendedVolume) * correctionFactor
        var ownPot = normalizeToGoodVolume(potPreFinal[i], volume, recommendedVolume) * correctionFactor
        //  Multiplier par 1000
        if (LiquidOrSkin.includes("liquid") && req.body.Volume) {
          ownPaot = Number(ownPaot) * 1000
          ownPot = Number(ownPot) * 1000
        }
        if (solvant && Number(concentration) === 1000 && LiquidOrSkin.includes("liquid")) { ownPaot = Number(ownPaot) + Number(solvant) }
        if (solvant && Number(concentration) === 1000 && LiquidOrSkin.includes("liquid")) { ownPot = Number(ownPot) + Number(solvant) }
        return { ownPaot: ownPaot.toFixed(2), ownPot: ownPot.toFixed(2), equation: equationArray[i] }
      } else {
        var ownPaot = row
        var ownPot = potPreFinal[i]
        return { ownPaot: ownPaot.toFixed(2), ownPot: ownPot.toFixed(2), equation: equationArray[i] }
      }
    })

    if (LiquidOrSkin.includes("liquid")) {
      consoleAndLog(filePath, '=== LIQUID ===');
      consoleAndLog(filePath, 'C Concentration: ' + concentration);
      consoleAndLog(filePath, 'F Dilution Factor: ' + dilutionFactor);
      consoleAndLog(filePath, 'D Density: ' + density);
      consoleAndLog(filePath, 'S Solvant: ' + solvant + '\n');

      consoleAndLog(filePath, 'Method volume: ' + recommendedVolume);
      consoleAndLog(filePath, 'Injected volume: ' + (!req.body.Volume ? 'None' : ('Raw: ' + req.body.Volume + ' and used : ' + volume)));
      // Ramenner au bon volume
      consoleAndLog(filePath, '\n - Before good volume -');
      consoleAndLog(filePath, '  Paot : ' + myPaot);
      consoleAndLog(filePath, '  Pot : ' + myPot);

      if (volume && req.body.Volume && !isNaN(myPaot)) myPaot = normalizeToGoodVolume(myPaot, volume, recommendedVolume)
      if (volume && req.body.Volume && !isNaN(myPot)) myPot = normalizeToGoodVolume(myPot, volume, recommendedVolume)

      consoleAndLog(filePath, '     - After -');
      consoleAndLog(filePath, '  Paot : ' + myPaot);
      consoleAndLog(filePath, '  Pot : ' + myPot);
    }

    consoleAndLog(filePath, '\nRaw deviceHealth: ' + deviationCoef)

    //consoleAndLog('Correction factor : ', correctionFactor)

    consoleAndLog(filePath, 'Used deviation coef: ' + correctionFactor);
    myPaot = Number(myPaot) * Number(correctionFactor)
    myPot = Number(myPot) * Number(correctionFactor)
    // Recuperer les paramètres + Calcul
    result = await db.query("select p.PublicName,p.Variable,p.absoluteMin,p.averageMin,p.averageMax,p.absoluteMax,mp.absMin,mp.min,mp.max,mp.absMax,p.Word1,p.Word2,p.Word3,p.Formula,p.Family,p.Score FROM method m INNER JOIN method_parameter mp ON mp.Method_IDMethod = m.IDMethod INNER JOIN parameter p ON p.IDParameter = mp.Parameter_IDParameter WHERE IDMethod = ?  AND Method_GroupParameterID=? GROUP BY p.Name", [IDMethod, IDGroupParameter])
      .then(result => result)
      .catch(err => undefined)
    if (result === undefined) { consoleAndLog(filePath, '=== ERROR === Error in fetch of parameter '); res.status(500).send({ message: 'Error in fetch of parameter' }); return }
    var myParams = []
    var parametersInString = result.map(param => {
      const score = param.Score
      const formule = param.Formula
      const variable = param.Variable
      const family = param.Family
      const publicName = param.PublicName
      //consoleAndLog(filePath, '--')
      //consoleAndLog(filePath, publicName);
      var paramResult = paramCalculatorV2(formule, variable, score, myPaot, myPot, mySso, deviationCoef, concentration)
      var value = paramResult.value
      const parsedFormule = paramResult.formule
      //consoleAndLog(filePath, parsedFormule);
      //consoleAndLog(filePath, value);
      //consoleAndLog(filePath, '--')
      if (value < 0) value = 0
      var absMin = param.absMin
      var min = param.min
      var max = param.max
      var absMax = param.absMax
      if (Number(param.absMin) === -1 || Number(param.absMax) === -1 || Number(param.min) === -1 || Number(param.max) === -1) {
        //console.log('Echelle propre paramètre et non par groupe de parametre car non valide');
        absMin = param.absoluteMin
        min = param.averageMin
        max = param.averageMax
        absMax = param.absoluteMax
      }
      myParams.push([publicName, family, value, min, max, absMin, absMax, param.Word1, param.Word2, param.Word3])
      return (publicName + ":" + family + ":" + value + ":" + min + ":" + max + ":" + absMin + ":" + absMax + ":" + param.Word1 + ":" + param.Word2 + ":" + param.Word3)
    })
    const UserHavePaotCoin = true
    if (!UserHavePaotCoin) { consoleAndLog(filePath, "=== ERROR === No enought coin to pay and receive data"); res.status(500).send({ message: 'No enought coin to pay and receive data' }); return }
    // multiplier par 1000 si liquide (Pur : corrige le 1000mg/ml  & Prépare c'est normal)
    if (LiquidOrSkin.includes("liquid") && req.body.Volume) {
      myPaot = Number(myPaot) * 1000
      myPot = Number(myPot) * 1000
    }
    // Ajouter le solvant si concentration === 1 && solvant défini 
    if (solvant && Number(concentration) === 1000 && LiquidOrSkin.includes("liquid")) { myPaot = Number(myPaot) + Number(solvant) }
    if (solvant && Number(concentration) === 1000 && LiquidOrSkin.includes("liquid")) { myPot = Number(myPot) + Number(solvant) }




    // Virer les champs non demandé 
    if (typeCalcul === 'paot') { myPot = null, mySso = null }
    if (typeCalcul === 'pot') { myPaot = null, mySso = null }
    mySso = null
    // Mettre a jour la bdd si vrai mesure
    if (isRealMeasure) {
      var datasetString = ''
      console.log(datasetValues);
      datasetValues.map(async (row, i) => {
        if (datasetValues.length - 1 === i) {
          //consoleAndLog(filePath, datasetID);
          datasetString = datasetString + '(' + datasetID[i] + ',' + IDGroupMeasure + ',' + '"" ,' + row.ownPaot + ',' + row.ownPot + ',\'' + JSON.stringify(row.equation) + '\')'
        } else {
          datasetString = datasetString + '(' + datasetID[i] + ',' + IDGroupMeasure + ',' + '"" ,' + + row.ownPaot + ',' + row.ownPot + ',\'' + JSON.stringify(row.equation) + '\'),'
        }
      })
      //consoleAndLog(filePath, 'Datasetstring : ');
      //consoleAndLog(filePath, datasetString);

      console.log('dataset : ');
      console.log(datasetString);
      if (datasetString.length > 4) {
        var ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress
        try {

          var geo = geoip.lookup(ip);
          var country = geo.country
        } catch (error) {
          var country = null
        }
        result = await db.query(`INSERT INTO measures_data (id,measures_groupID,data,ownPaot,ownPot,equation) VALUES ${datasetString} ON DUPLICATE KEY UPDATE ownPaot=VALUES(ownPaot),ownPot=VALUES(ownPot),equation=VALUES(equation)`)
          .then(resul => result)
          .catch(err => { console.log(err); return undefined })
        if (result === undefined) { consoleAndLog(filePath, '=== ERROR === Failled to update the dataset own values from calculed values'); res.status(500).send({ message: 'Failled to update the dataset own values from calculed values' }); return }
        result = await db.query("UPDATE measures_group SET paot=?,pot=?,sso=?,paramsValue=?,Method_GroupParameterID=?,Volume=?,Concentration=?,DilutionFactor=?,Density=? WHERE id=? ", [myPaot, myPot, mySso, parametersInString.join('\r\n'), IDGroupParameter, volume, concentration, dilutionFactor, density, IDGroupMeasure])
          .then(result => result)
          .catch(err => undefined)
        if (result === undefined) { consoleAndLog(filePath, '=== ERROR === Failled to update the measure group from calculed values'); res.status(500).send({ message: 'Failled to update the measure group from calculed values' }); return }
      } else {
        consoleAndLog(filePath, '=== ERROR === All dataset are invalid, or too short. Unable to calcule your result')
        res.status(500).send({ message: 'All dataset are invalid, or too short. Unable to calcule your result', code: 101 })
        return
      }
      // Si réussi, retirer les coins
    }
    consoleAndLog(filePath, '\n--- Final Results ---')
    consoleAndLog(filePath, 'Paot : ' + myPaot)
    consoleAndLog(filePath, 'Pot : ' + myPot)

    // Enregistrer le fichier log
    // Envoyer le resultat
    res.send({
      message: "Réussi",
      paot: myPaot,
      pot: myPot,
      sso: mySso,
      params: myParams,
      datasetValues: datasetValues
    })
  })
  return app
}
module.exports = { initCalculatorEngineRoutes }