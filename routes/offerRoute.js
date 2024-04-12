const express = require("express");


function initOfferRoutes(db) {
  const app = express.Router();

  app.get('/offers', async (req, res) => {
    db.query('SELECT * FROM offer')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching offers' });
      })
  })
  return app
}
module.exports = { initOfferRoutes };