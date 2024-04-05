const express = require('express');
const isAuthenticated = require('../middlewares/isAuthenticated.js');
const isAdmin = require('../middlewares/isAdmin.js');

function initParameterRoutes(db) {
  const app = express.Router()

  // Create a parameter
  app.post('/parameter/create', isAuthenticated, isAdmin, (req, res) => {
    const { name, family, publicName, formulae, explication, absoluteMin, averageMin, averageMax, absoluteMax, word1, word2, word3, goal, type } = req.body
    console.log(req.body);
    console.log(name, family, publicName, explication, formulae, absoluteMin, averageMin, averageMax, absoluteMax, word1, word2, word3, goal, type);
    if (!name || !family || !publicName || !explication || !formulae || !absoluteMin || !averageMin || !averageMax || !absoluteMax || !word1 || !word2 || !word3 || !goal || !type) { res.status(400).send({ message: 'Error during creating parameter' }); return };
    db.query('INSERT INTO parameter (Name,Family_ID,PublicName,Formula,Explication,absoluteMin,averageMin,averageMax,absoluteMax,Word1,Word2,Word3,Score,Type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [name, family, publicName, formulae, explication, absoluteMin, averageMin, averageMax, absoluteMax, word1, word2, word3, goal, type])
      .then(result => {
        res.send({ message: 'Created' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during creating parameter' });
      })
  })

  // Get all parameters list
  app.get('/parameter/all', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT IDParameter,parameter.Name,Comments,Explication,PublicName,parameter_family.Name as FamilyName,Family_ID,Formula,Variable,absoluteMin,averageMin,averageMax,absoluteMax,Word1,Word2,Word3,Score,Type FROM `parameter` INNER JOIN parameter_family ON parameter_family.id = parameter.Family_ID;')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching parameters' });
      })
  })

  // Get all families list
  app.get('/parameter/family/all', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM parameter_family;')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching families' });
      })
  })

  // Delete a parameter
  app.delete('/parameter/:id', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    if (!id || isNaN(id)) res.status(400).send({ message: 'Error during deleting parameter' });
    db.query('DELETE FROM parameter WHERE IDParameter = ?', [id])
      .then(result => {
        res.send({ message: 'Deleted' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during deleting parameter' });
      })
  })


  // Change the name of the parameter
  app.post('/parameter/:id/changeName', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { name } = req.body
    if (!id || isNaN(id) || !name) res.status(400).send({ message: 'Error during changing name' });
    db.query('UPDATE parameter SET Name = ? WHERE IDParameter = ?', [name, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing name' });
      })
  })

  // Change the public name of the parameter
  app.post('/parameter/:id/changePublicName', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { publicName } = req.body
    if (!id || isNaN(id) || !publicName) res.status(400).send({ message: 'Error during changing public name' });
    db.query('UPDATE parameter SET PublicName = ? WHERE IDParameter = ?', [publicName, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing public name' });
      })
  })
  // Change the word1 of the parameter
  app.post('/parameter/:id/changeWord1', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { word1 } = req.body
    if (!id || isNaN(id) || !word1) res.status(400).send({ message: 'Error during changing word1' });
    db.query('UPDATE parameter SET Word1 = ? WHERE IDParameter = ?', [word1, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing word1' });
      })
  })
  // Change the word2 of the parameter
  app.post('/parameter/:id/changeWord2', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { word2 } = req.body
    if (!id || isNaN(id) || !word2) res.status(400).send({ message: 'Error during changing word2' });
    db.query('UPDATE parameter SET Word2 = ? WHERE IDParameter = ?', [word2, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing word2' });
      })
  })
  // Change the word3 of the parameter
  app.post('/parameter/:id/changeWord3', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { word3 } = req.body
    if (!id || isNaN(id) || !word3) res.status(400).send({ message: 'Error during changing word3' });
    db.query('UPDATE parameter SET Word3 = ? WHERE IDParameter = ?', [word3, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing word3' });
      })
  })
  // Change the formula of the parameter
  app.post('/parameter/:id/changeFormula', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { formula } = req.body
    if (!id || isNaN(id) || !formula) res.status(400).send({ message: 'Error during changing formula' });
    db.query('UPDATE parameter SET Formula = ? WHERE IDParameter = ?', [formula, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing formula' });
      })
  })
  // Change the family of the parameter
  app.post('/parameter/:id/changeFamily', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { family } = req.body
    if (!id || isNaN(id) || !family) res.status(400).send({ message: 'Error during changing family' });
    db.query('UPDATE parameter SET Family_ID = ? WHERE IDParameter = ?', [family, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing family' });
      })
  })
  // Change the goal/score of the parameter
  app.post('/parameter/:id/changeGoal', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { goal } = req.body
    if (!id || isNaN(id) || !goal) res.status(400).send({ message: 'Error during changing goal' });
    db.query('UPDATE parameter SET Score = ? WHERE IDParameter = ?', [goal, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing score' });
      })
  })
  // Change the type of the parameter
  app.post('/parameter/:id/changeType', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { type } = req.body
    if (!id || isNaN(id) || !type) res.status(400).send({ message: 'Error during changing type' });
    db.query('UPDATE parameter SET Type = ? WHERE IDParameter = ?', [type, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing type' });
      })
  })
  // Change AbsoluteMin of the parameter
  app.post('/parameter/:id/changeAbsoluteMin', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { absoluteMin } = req.body
    if (!id || isNaN(id) || !absoluteMin) res.status(400).send({ message: 'Error during changing absoluteMin' });
    db.query('UPDATE parameter SET absoluteMin = ? WHERE IDParameter = ?', [absoluteMin, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing absoluteMin' });
      })
  })
  // Change the averageMin of the parameter
  app.post('/parameter/:id/changeAverageMin', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { averageMin } = req.body
    if (!id || isNaN(id) || !averageMin) res.status(400).send({ message: 'Error during changing averageMin' });
    db.query('UPDATE parameter SET averageMin = ? WHERE IDParameter = ?', [averageMin, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing averageMin' });
      })
  })
  // Change the averageMax of the parameter
  app.post('/parameter/:id/changeAverageMax', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { averageMax } = req.body
    if (!id || isNaN(id) || !averageMax) res.status(400).send({ message: 'Error during changing averageMax' });
    db.query('UPDATE parameter SET averageMax = ? WHERE IDParameter = ?', [averageMax, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing averageMax' });
      })
  })

  // Change the absoluteMax of the parameter
  app.post('/parameter/:id/changeAbsoluteMax', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { absoluteMax } = req.body
    if (!id || isNaN(id) || !absoluteMax) res.status(400).send({ message: 'Error during changing absoluteMax' });
    db.query('UPDATE parameter SET absoluteMax = ? WHERE IDParameter = ?', [absoluteMax, id])
      .then(result => {
        res.send({ message: 'Updated', id, absoluteMax })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing absoluteMax' });
      })
  })
  // Save the commentaries of the parameter
  app.post('/parameter/:id/changeComment', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { comment } = req.body
    if (!id || isNaN(id) || !comment) res.status(400).send({ message: 'Error during changing comment' });
    db.query('UPDATE parameter SET Comments = ? WHERE IDParameter = ?', [comment, id])
      .then(result => {
        res.send({ message: 'Updated', id, comment })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing comment' });
      })
  })

  // Save the explication of the parameter
  app.post('/parameter/:id/changeExplication', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { explication } = req.body
    if (!id || isNaN(id) || !explication) res.status(400).send({ message: 'Error during changing explication' });
    db.query('UPDATE parameter SET Explication = ? WHERE IDParameter = ?', [explication, id])
      .then(result => {
        res.send({ message: 'Updated', id, explication })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing explication' });
      })
  })

  return app
}
module.exports = { initParameterRoutes };