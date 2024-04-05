const express = require("express");

function initCompanyRoutes(db) {
  const app = express.Router()
  // To get company settings like color etc...
  app.get('/company/:name', (req, res) => {
    const name = req.params.name;
    db.query('SELECT * FROM company WHERE name = ?', [name])
      .then(result => { res.send(result); })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching companies' });
      })
  })
  return app
}
module.exports = { initCompanyRoutes };