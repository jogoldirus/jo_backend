const express = require('express');
const { hashPassword } = require('./authRoute.js');
const isAuthenticated = require('../middlewares/isAuthenticated.js');
const isAdmin = require('../middlewares/isAdmin.js');

function initUserRoutes(db) {
  const app = express.Router()


  // Pay user basket
  app.post('/user/basket/pay', isAuthenticated, async (req, res) => {
    const { basket, creditCardData } = req.body;
    const userID = req.user.userID;
    if (!Array.isArray(basket) || !basket || !creditCardData || basket.length === 0) res.status(400).send({ message: 'Missing fields or invalid' });

    // Check if user has enough money
    /////

    // Pay
    /////


    // Generate ticket for each offer item in basket
    let result = await Promise.all(basket.map(async offer => {
      return await db.query('INSERT INTO ticket (userID, offerID) VALUES (?,?)', [userID, offer.id])
        .then(result => {
          return Promise.resolve(result);
        })
        .catch(err => {
          return Promise.reject(err);
        })
    }))
    console.log(result);
    res.send({ message: 'Payment done' });
  })
  // Delete user
  app.delete('/user/:id', isAuthenticated, isAdmin, (req, res) => {
    const ids = req.params.id ? req.params.id.split("|") : null;
    if (!ids) res.status(400).send({ message: 'Error during deleting user' });
    if (ids) {
      db.query('DELETE FROM user WHERE IDUser IN (?)', [ids])
        .then(result => {
          res.send({ message: 'Deleted' })
        })
        .catch(err => {
          console.log(err);
          res.status(400).send({ message: 'Error during deleting user' });
        })
    }
  })
  return app
}
module.exports = { initUserRoutes };