const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");


function initOfferRoutes(db) {
  const app = express.Router();

  app.get('/offers', async (req, res) => {
    db.query('SELECT event.showOffers,event.name,offer.*,event.name as eventName FROM offer INNER JOIN event ON offer.eventID = event.id')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        // console.log(err);
        res.status(500).send({ message: err.message });
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
        res.status(500).send({ message: err.message })
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
  // Get offers sell stats
  app.get('/offer/stats', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT offer.id,offer.name,COUNT(ticket.id) AS ticketCount FROM ticket INNER JOIN  offer ON offer.id = ticket.offerID GROUP BY  offer.id, offer.name;')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching sell stats' });
      })
  })
  // Create  offer
  app.post('/offer/create', isAuthenticated, isAdmin, (req, res) => {
    const { name, price, description, eventID, placeInclude, color } = req.body;
    if (!name || !price || !description || !eventID || !placeInclude || !color) { res.status(400).send({ message: 'Missing fields' }); return };
    db.query('INSERT INTO offer (name, price, description, eventID, placeInclude, color) VALUES (?,?,?,?,?,?)', [name, price, description, eventID, placeInclude, color])
      .then(result => {
        res.send({ message: 'Offer created' });
        return
      })
      .catch(err => {
        console.log("erreur");
        console.log(err);
        res.status(400).send({ message: 'Error during offer creation' });
      })
  })

  // Delete offer
  app.delete('/offer/:id', isAuthenticated, isAdmin, (req, res) => {
    const ids = req.params.id ? req.params.id.split("|") : null;
    if (!ids) res.status(400).send({ message: 'Error during deleting offer' });
    if (ids) {
      let query = 'DELETE FROM offer WHERE id IN (?)';
      if (ids.length === 1) query = 'DELETE FROM offer WHERE id = ?';
      db.query(query, [ids])
        .then(result => {
          res.send({ message: 'Deleted' })
        })
        .catch(err => {
          console.log(err);
          res.status(400).send({ message: 'Error during deleting offer' });
        })
    }
  })
  return app
}
module.exports = { initOfferRoutes };