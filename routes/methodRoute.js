const isAuthenticated = require('../middlewares/isAuthenticated.js');
const isAdmin = require('../middlewares/isAdmin.js');
const express = require('express');
function initMethodRoute(db) {
  const app = express.Router()
  // GET all methods
  app.get('/method/all', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM `method` INNER JOIN type ON type.id = method.TypeID;')
      .then(result => {
        res.send(result)
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error getting methods' })
      })
  })

  // Get method's coefficients
  app.get('/method/:id/coefficients', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM `coefficient` WHERE  Method_IDMethod = ?', [req.params.id])
      .then(result => {
        res.send(result)
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error getting coefficients' })
      })
  })

  // Change method's name
  app.post('/method/:id/changename', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Name = ? WHERE IDMethod = ?', [req.body.name, req.params.id])
      .then(result => {
        res.send({ message: 'Name changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing name' })
      })
  })

  // Change method's keyword
  app.post('/method/:id/changekeyword', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Keyword = ? WHERE IDMethod = ?', [req.body.keyword, req.params.id])
      .then(result => {
        res.send({ message: 'Keyword changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing keyword' })
      })
  })
  // Change method's volume
  app.post('/method/:id/changevolume', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Volume = ? WHERE IDMethod = ?', [req.body.volume, req.params.id])
      .then(result => {
        res.send({ message: 'Volume changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing volume' })
      })
  })
  // Change method's type
  app.post('/method/:id/changeliquidorskin', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Type changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing type' })
      })
  })
  // Change method's fixe or variable
  app.post('/method/:id/changefixeorvariable', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Fixe or variable changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing fixe or variable' })
      })
  })
  // Change method's if need control T1
  app.post('/method/:id/changecontrolT1', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Control T1 changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing control T1' })
      })
  })

  // Change method's Min T1
  app.post('/method/:id/changeMinT1', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.MinT1, req.params.id])
      .then(result => {
        res.send({ message: 'Min T1 changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing Min T1' })
      })
  })
  // Change method's Max T1
  app.post('/method/:id/changeMaxT1', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.MaxT1, req.params.id])
      .then(result => {
        res.send({ message: 'Max T1 changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing Max T1' })
      })
  })
  // Change method's T1
  app.post('/method/:id/changeT1', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.T1, req.params.id])
      .then(result => {
        res.send({ message: 'T1 changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing T1' })
      })
  })
  // Change method's T2
  app.post('/method/:id/changeT2', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.T2, req.params.id])
      .then(result => {
        res.send({ message: 'T2 changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing T2' })
      })
  })
  // Change method's T3
  app.post('/method/:id/changeT3', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.T3, req.params.id])
      .then(result => {
        res.send({ message: 'T3 changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing T3' })
      })
  })

  /// Change Wording
  // Change method's setup wording
  app.post('/method/:id/changesetupwording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_setup, req.params.id])
      .then(result => {
        res.send({ message: 'Setup wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing setup wording' })
      })
  })
  // Change method's T1 Too High wording
  app.post('/method/:id/changeT1TooHighWording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_t1toohigh, req.params.id])
      .then(result => {
        res.send({ message: 'T1 Too High wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing T1 Too High wording' })
      })
  })
  // Change method's T1 Too Low wording
  app.post('/method/:id/changeT1TooLowWording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_t1toolow, req.params.id])
      .then(result => {
        res.send({ message: 'T1 Too Low wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing T1 Too Low wording' })
      })
  })
  // Change method's first injection wording
  app.post('/method/:id/changefirstinjectionwording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_firstinjection, req.params.id])
      .then(result => {
        res.send({ message: 'First injection wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing first injection wording' })
      })
  })
  // Change method's second injection wording
  app.post('/method/:id/changesecondinjectionwording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_secondinjection, req.params.id])
      .then(result => {
        res.send({ message: 'Second injection wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing second injection wording' })
      })
  })
  // Change method's matrice oxydant wording
  app.post('/method/:id/changematriceoxydantwording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_oxydantinmatrix, req.params.id])
      .then(result => {
        res.send({ message: 'Matrice oxydant wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing matrice oxydant wording' })
      })
  })
  // Change method's matrice antioxydant wording
  app.post('/method/:id/changematriceantioxydantwording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_antioxydantinmatrix, req.params.id])
      .then(result => {
        res.send({ message: 'Matrice antioxydant wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing matrice antioxydant wording' })
      })
  })
  // Change method's not enought activity wording
  app.post('/method/:id/changenotenoughtactivitywording', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Algo = ? WHERE IDMethod = ?', [req.body.wording_notenoughactivity, req.params.id])
      .then(result => {
        res.send({ message: 'Not enought activity wording changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing not enought activity wording' })
      })
  })



  // Change method's explication
  app.post('/method/:id/changeexplication', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET Explication = ? WHERE IDMethod = ?', [req.body.explication, req.params.id])
      .then(result => {
        res.send({ message: 'Explication changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing explication' })
      })
  })
  // Change absolute min 
  app.post('/method/:id/changeabsoluteMin', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET AbsoluteMinPaotPotReference = ? WHERE IDMethod = ?', [req.body.absoluteMin, req.params.id])
      .then(result => {
        res.send({ message: 'Absolute min changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing absolute min' })
      })
  })
  // Change average min
  app.post('/method/:id/changeaverageMin', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET MinPaotPotReference = ? WHERE IDMethod = ?', [req.body.averageMin, req.params.id])
      .then(result => {
        res.send({ message: 'Average min changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing average min' })
      })
  })
  // Change average max
  app.post('/method/:id/changeaverageMax', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET MaxPaotPotReference = ? WHERE IDMethod = ?', [req.body.averageMax, req.params.id])
      .then(result => {
        res.send({ message: 'Average max changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing average max' })
      })
  })
  // Change absolute max
  app.post('/method/:id/changeabsoluteMax', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET AbsoluteMaxPaotPotReference = ? WHERE IDMethod = ?', [req.body.absoluteMax, req.params.id])
      .then(result => {
        res.send({ message: 'Absolute max changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing absolute max' })
      })
  })


  /// Change method's coefficient paot X (C1)
  app.post('/method/:id/changecoefpaotx', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C1 = ? WHERE Method_IDMethod = ? AND Name = "paot"', [req.body.paotX, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient paot X changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient paot X' })
      })
  })
  /// Change method's coefficient paot Y (C2)
  app.post('/method/:id/changecoefpaoty', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C2 = ? WHERE Method_IDMethod = ? AND Name = "paot"', [req.body.paotY, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient paot Y changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient paot Y' })
      })
  })
  // Change method's coefficient paot Z (C3)
  app.post('/method/:id/changecoefpaotz', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C3 = ? WHERE Method_IDMethod = ? AND Name = "paot"', [req.body.paotZ, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient paot z changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient paot Z' })
      })
  })
  // Change method's coefficient paot E (C4)
  app.post('/method/:id/changecoefpaote', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C4 = ? WHERE Method_IDMethod = ? AND Name = "paot"', [req.body.paotE, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient paot E changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient paot E' })
      })
  })

  // Change method's coefficient pot X (C1)
  app.post('/method/:id/changecoefpotx', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C1 = ? WHERE Method_IDMethod = ? AND Name = "pot"', [req.body.potX, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient pot X changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient pot X' })
      })
  })
  // Change method's coefficient pot Y (C2)
  app.post('/method/:id/changecoefpoty', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C2 = ? WHERE Method_IDMethod = ? AND Name = "pot"', [req.body.potY, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient pot Y changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient pot Y' })
      })
  })
  // Change method's coefficient pot Z (C3)
  app.post('/method/:id/changecoefpotz', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C3 = ? WHERE Method_IDMethod = ? AND Name = "pot"', [req.body.potZ, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient pot Z changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient pot Z' })
      })
  })
  // Change method's coefficient pot E (C4)
  app.post('/method/:id/changecoefpote', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `coefficient` SET C4 = ? WHERE Method_IDMethod = ? AND Name = "pot"', [req.body.potE, req.params.id])
      .then(result => {
        res.send({ message: 'Coefficient pot E changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing coefficient pot E' })
      })
  })



  // Change method's left variable of simple paot calculation
  app.post('/method/:id/changepaotsimpleleft', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormPaotXPaot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable paot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable paot' })
      })
  })
  // Change method's right variable of simple paot calculation
  app.post('/method/:id/changepaotsimpleright', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormPaotXPaot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable paot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable paot' })
      })
  })
  // Change method's left variable of simple pot calculation
  app.post('/method/:id/changepotsimpleleft', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormPaotXPot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable pot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable pot' })
      })
  })
  // Change method's right variable of simple pot calculation
  app.post('/method/:id/changepotsimpleright', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormPaotXPot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable pot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable pot' })
      })
  })
  // Change method's left variable of mixte paot calculation
  app.post('/method/:id/changepaotmixteleft', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormMixteXPaot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable paot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable paot' })
      })
  })
  // Change method's right variable of mixte paot calculation
  app.post('/method/:id/changepaotmixteright', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormMixteXPaot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable paot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable paot' })
      })
  })
  // Change method's left variable of mixte pot calculation
  app.post('/method/:id/changepotmixteleft', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormMixteXPot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable pot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable pot' })
      })
  })
  // Change method's right variable of mixte pot calculation
  app.post('/method/:id/changepotmixteright', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `method` SET ScoreFormMixteXPot = ? WHERE IDMethod = ?', [req.body.variable, req.params.id])
      .then(result => {
        res.send({ message: 'Variable pot changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing variable pot' })
      })
  })
  return app
}

module.exports = { initMethodRoute };