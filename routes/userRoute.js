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

    // Check if user has enough money and pay
    /////


    // Generate ticket for each offer item in basket
    let result = await Promise.all(basket.map(async offer => {
      const generateTicketKey = async () => {
        const key = Math.floor(Math.random() * 10000000000);
        const keyExists = await db.query('SELECT * FROM ticket WHERE ticketKey = ?', [key])
          .then(result => {
            if (result.length) return true;
            else return false;
          })
          .catch(err => {
            console.log(err);
            res.status(400).send({ message: 'Error during ticket generaton' });
          })
        if (keyExists) return generateAccountKey();
        return key;
      };
      const ticketKey = await generateTicketKey();
      return await db.query('INSERT INTO ticket (userID, offerID,price,ticketKey) VALUES (?,?,?,?)', [userID, offer.id, offer.price, ticketKey])
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

  // Get user's tickets
  app.get('/user/tickets', isAuthenticated, (req, res) => {
    const id = req.user.userID;
    if (!id) res.status(400).send({ message: 'Missing fields' });
    db.query('SELECT user.name,user.forename,ticket.id,ticket.date as orderDate,offer.name as offerName,placeInclude,ticket.price,description,event.name as eventName,event.date as eventDate,event.city,event.adress,CONCAT(user.userKey,"-", ticket.ticketKey) AS completeKey FROM ticket INNER JOIN user ON user.id = ticket.userID INNER JOIN offer ON offer.id = ticket.offerID INNER JOIN event ON event.id = offer.eventID WHERE userID = ?;', [id])
      .then(result => {
        result.sort((a, b) => b.date - a.date);
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching tickets' });
      })
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


  // Verify user ticket

  app.post('/user/ticket/verify/:completeKey', async (req, res) => {
    const completeKey = req.params.completeKey;
    if (!completeKey) res.status(400).send({ message: 'Missing fields' });
    const [userKey, ticketKey] = completeKey.split("-");
    db.query('SELECT user.name,user.forename,ticket.id,ticket.date as orderDate,offer.name as offerName,placeInclude,ticket.price,description,event.name as eventName,event.date as eventDate,event.city,event.adress,CONCAT(user.userKey,"-", ticket.ticketKey) AS completeKey FROM ticket INNER JOIN user ON user.id = ticket.userID INNER JOIN offer ON offer.id = ticket.offerID INNER JOIN event ON event.id = offer.eventID WHERE user.userKey = ? AND ticket.ticketKey = ? LIMIT 1;', [userKey, ticketKey])
      .then(result => {
        if (result.length === 1) res.send(result[0]);
        else res.status(400).send({ message: 'Ticket not found' });
        return
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching ticket' });
      })
  })
  return app
}
module.exports = { initUserRoutes };