const express = require('express');
const isAuthenticated = require('../middlewares/isAuthenticated.js');
const isAdmin = require('../middlewares/isAdmin.js');

function initEventRoutes(db) {
  const app = express.Router()

  app.get('/events', async (req, res) => {
    db.query('SELECT * FROM event')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching events' });
      })
  })

  // Change event's name
  app.post('/events/:id/changename', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `event` SET Name = ? WHERE id = ?', [req.body.name, req.params.id])
      .then(result => {
        res.send({ message: 'Name changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing name' })
      })
  })
  // Change event's date
  app.post('/events/:id/changedate', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `event` SET Date = ? WHERE id = ?', [req.body.date, req.params.id])
      .then(result => {
        res.send({ message: 'Date changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing date' })
      })
  })
  // Change event's city
  app.post('/events/:id/changecity', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `event` SET city = ? WHERE id = ?', [req.body.city, req.params.id])
      .then(result => {
        res.send({ message: 'City changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing city' })
      })
  })
  // Change event's adress
  app.post('/events/:id/changeadress', isAuthenticated, isAdmin, (req, res) => {
    db.query('UPDATE `event` SET adress = ? WHERE id = ?', [req.body.adress, req.params.id])
      .then(result => {
        res.send({ message: 'Adress changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing adress' })
      })
  })

  return app
}
module.exports = { initEventRoutes };