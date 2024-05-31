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
  // Create an event
  app.post('/events/create', isAuthenticated, isAdmin, (req, res) => {
    const { name, date, city, adress, showOffers = 0 } = req.body;
    if (!name || !date || !city || !adress || showOffers === undefined) res.status(400).send({ message: 'Missing fields' });
    db.query('INSERT INTO event (name, date, city, adress, showOffers) VALUES (?,?,?,?,?)', [name, date, city, adress, showOffers])
      .then(result => {
        res.send({ message: 'Event created' });
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during event creation' });
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

  // Change event's visibility
  app.post('/events/:id/changevisibility', isAuthenticated, isAdmin, (req, res) => {
    console.log(req.body.visibility, req.params.id);
    db.query('UPDATE `event` SET showOffers = ? WHERE id = ?', [req.body.visibility, req.params.id])
      .then(result => {
        res.send({ message: 'Visibility changed' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({ message: 'Error changing visibility' })
      })
  })

  // Delete event
  app.delete('/events/:id', isAuthenticated, isAdmin, (req, res) => {
    const ids = req.params.id ? req.params.id.split("|") : null;
    if (!ids) res.status(400).send({ message: 'Error during deleting event' });
    if (ids) {
      let query = 'DELETE FROM event WHERE id IN (?)';
      if (ids.length === 1) query = 'DELETE FROM event WHERE id = ?';
      db.query(query, [ids])
        .then(result => {
          res.send({ message: 'Deleted' })
        })
        .catch(err => {
          console.log(err);
          res.status(400).send({ message: 'Error during deleting event' });
        })
    }
  })

  return app
}
module.exports = { initEventRoutes };