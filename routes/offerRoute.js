const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");


function initOfferRoutes(db) {
  const app = express.Router();

  app.get('/offers', async (req, res) => {
    db.query('SELECT offer.*,event.name as eventName FROM offer INNER JOIN event ON offer.eventID = event.id')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching offers' });
      })
  })
  // Change offer's name
  app.post('/offer/:id/changename', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `offer` SET name = ? WHERE id = ?', [req.body.name, req.params.id])
      .then(result => {
        res.send({ message: 'Name changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing name' })
      })
  })
  // Change offer's price
  app.post('/offer/:id/changeprice', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `offer` SET price = ? WHERE id = ?', [req.body.price, req.params.id])
      .then(result => {
        res.send({ message: 'Price changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing price' })
      })
  })

  // Change offer's description
  app.post('/offer/:id/changedescription', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `offer` SET description = ? WHERE id = ?', [req.body.description, req.params.id])
      .then(result => {
        res.send({ message: 'Description changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing description' })
      })
  })

  // Change offer's eventID
  app.post('/offer/:id/changeevent', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `offer` SET eventID = ? WHERE id = ?', [req.body.eventID, req.params.id])
      .then(result => {
        res.send({ message: 'EventID changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing eventID' })
      })
  })
  // Change offer's placeInclude
  app.post('/offer/:id/changeplaceInclude', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `offer` SET placeInclude = ? WHERE id = ?', [req.body.placeInclude, req.params.id])
      .then(result => {
        res.send({ message: 'PlaceInclude changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing placeInclude' })
      })
  })
  // Change offer's color
  app.post('/offer/:id/changecolor', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `offer` SET color = ? WHERE id = ?', [req.body.color, req.params.id])
      .then(result => {
        res.send({ message: 'Color changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing color' })
      })
  })
  return app
}
module.exports = { initOfferRoutes };