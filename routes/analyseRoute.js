const dayjs = require('dayjs');
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const isAdminOrOwnAnalyse = require('../middlewares/isAdminOrOwnAnalyse');
const express = require('express');
const fs = require('fs');
const path = require('path');
function initAnalyseRoutes(db) {
  const app = express.Router()
  // Get all analyse maded by the user
  app.get('/analyse/ownlist', isAuthenticated, (req, res) => {
    const id = req.user.userID
    db.query('SELECT measures_group.id,measures_group.Name,paot,device.Name as deviceName,method.Name as methodName,type.name as type,measures_group.CreationDate FROM measures_group INNER JOIN device ON device.IDDevice = measures_group.Device_IDDevice INNER JOIN method ON method.IDMethod = measures_group.Method_IDMethod INNER JOIN type ON type.id = method.TypeID WHERE Maker_IDUser = ?; ', [id])
      .then(result => { res.send(result); })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching companies' });
      })
  })
  // Get all analyses
  app.get('/analyse/all', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT measures_group.id,measures_group.Name,paot,device.Name as deviceName,method.Name as methodName,type.name as type,measures_group.CreationDate FROM measures_group INNER JOIN device ON device.IDDevice = measures_group.Device_IDDevice INNER JOIN method ON method.IDMethod = measures_group.Method_IDMethod INNER JOIN type ON type.id = method.TypeID; ')
      .then(result => { res.send(result); })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching companies' });
      })
  })
  // Get detailled data of an analyse ( need to own analyse or be admin)
  app.get('/analyse/:id', isAuthenticated, isAdminOrOwnAnalyse, async (req, res) => {
    const id = req.params.id
    db.query("SELECT mg.id,mg.Volume,mg.Concentration,mg.DilutionFactor,mg.Density, mg.paramsValue, mg.Method_GroupParameterID,GROUP_CONCAT(IFNULL(md.id, '') SEPARATOR '|') AS setId, GROUP_CONCAT(IFNULL(md.ownPaot, '') SEPARATOR '|') AS ownPaot, GROUP_CONCAT(IFNULL(md.ownPot, '') SEPARATOR '|') AS ownPot, GROUP_CONCAT(IFNULL(md.equation, '') SEPARATOR '|') AS equation,GROUP_CONCAT(IFNULL(md.data, '') SEPARATOR '|') AS dataset, mgp.name as mgpName, mgp.AbsoluteMinPaotPotReference,mgp.MinPaotPotReference, mgp.MaxPaotPotReference,mgp.AbsoluteMaxPaotPotReference,mg.TargetUser_ID,mg.paot,mg.pot,mg.rso,mg.sso FROM measures_group mg LEFT JOIN method_groupparameter mgp ON mgp.id = mg.Method_GroupParameterID LEFT JOIN measures_data md ON md.measures_groupID = mg.id WHERE mg.id = ? GROUP BY mg.id; ", [id])
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching analyse' });
      })
  })

  // Delete an analyse
  app.delete('/analyse/:id', isAuthenticated, isAdmin, (req, res) => {
    const ids = req.params.id ? req.params.id.split("|") : null;
    if (!ids) res.status(400).send({ message: 'Error during deleting analyse' });
    if (ids) {
      db.query('DELETE FROM measures_group WHERE id IN (?)', [ids])
        .then(result => {
          res.send({ message: 'Deleted' })
        })
        .catch(err => {
          console.log(err);
          res.status(400).send({ message: 'Error during deleting analyse' });
        })
    }
  })

  // Create a new analyse
  app.post('/analyse/create', isAuthenticated, async (req, res) => {
    const { name, method, parameterGroup, channels, purOrPrepared, volume, concentration, solvant, dilutionFactor, density, weight, size, age, inUseDevice, allDatas } = req.body
    const { userID } = req.user
    const currentDate = new Date();
    const creationDate = dayjs(currentDate).format('YYYY-MM-DD HH:mm:ss')
    let analyseID = await db.query("INSERT INTO measures_group (Name,Maker_IDUser,Device_IDDevice,Method_IDMethod,Method_GroupParameterID,Weight,Height,Age,Volume,Concentration,DilutionFactor,Density,CreationDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ", [name, userID, inUseDevice.ID, method, parameterGroup, weight, size, age, volume, concentration, dilutionFactor, density, creationDate])
      .then(result => {
        return result.insertId
      })
      .catch(err => {
        return undefined
      })
    if (!analyseID) {
      res.status(400).send({ message: 'Error during creating analyse' });
      return
    }
    res.send({ message: 'Created', id: analyseID })
  })
  app.post('/analyse/:id/addMultipleData', isAuthenticated, async (req, res) => {
    // Check if he is the owner of the analyse
    const id = req.params.id
    const { userID } = req.user
    const { data } = req.body
    const makerID = await db.query("SELECT Maker_IDUser FROM measures_group WHERE id = ?; ", [id])
      .then(result => {
        return result[0].Maker_IDUser
      })
      .catch(err => {
        return undefined
      })
    if (makerID != userID) {
      res.status(400).send({ message: 'Error during adding data' });
      return
    }

    function* flattenArrays(data) {
      for (const { data: dataArray } of Object.values(data)) {
        for (const row of dataArray) {
          let csvRow = '';
          [...row.t1, ...row.t2, ...row.t3].forEach(({ label, value }) => {
            csvRow += `${label};${value}\n`;
          });
          yield csvRow.trim();
        }
      }
    }

    const dataInsert = [...flattenArrays(data)];
    let sql = 'INSERT INTO measures_data (measures_groupID, data) VALUES ?';
    let values = dataInsert.map(data => [id, data]);

    let result = await db.query(sql, [values], (err, result) => {
      if (err) throw err;
      console.log(`Inserted ${result.affectedRows} rows.`);
    });
    console.log(result);
    res.send({ message: 'Data added' })
    return
  })


  ////// Recuperer les logs d'une mesure sous forme de tableau {[logs:[...,...,...]]}
  app.get('/analyse/:id/logs', isAuthenticated, isAdminOrOwnAnalyse, async (req, res) => {
    const { id } = req.params;
    // Get log files names from directory
    const listLogFiles = (dir, id) => {
      return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          const matchingFiles = files.filter(file => file.includes(`Real_${id}_`));
          resolve(matchingFiles);
        });
      });
    };
    // Read log file content
    const readLogFile = (filePath) => {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });
    };
    // Regroup all logs in one array with the list and reader
    const readAllLogs = async (dir, files) => {
      const allLogs = [];
      for (const file of files) {
        const filePath = path.join(dir, file);
        const logs = await readLogFile(filePath);
        allLogs.push({ fileName: file, log: logs });
      }
      return allLogs;
    };
    const files = await listLogFiles('./logs', id);
    const allLogs = await readAllLogs('./logs', files);
    res.send({ logs: allLogs });
  })
  return app
}
module.exports = { initAnalyseRoutes };