const express = require('express');
const { hashPassword } = require('./authRoute.js');
const isAuthenticated = require('../middlewares/isAuthenticated.js');
const isAdmin = require('../middlewares/isAdmin.js');

function initUserRoutes(db) {
  const app = express.Router()

  // Get all users list
  app.get('/user/all', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT IDUser,Company_id,Rolecompany_id,role_company.name as companyRole,Role_IDRole,role.Name as insideRole,role.Level,Email,PaotCoin,PhoneNumber FROM user INNER JOIN role ON Role_IDRole = role.IDRole INNER JOIN role_company ON role_company.id = user.Rolecompany_id')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching users' });
      })
  })
  // Get all device allowed for a user
  app.get('/user/:id/alloweddevices', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    console.log(id);
    if (!id || isNaN(id)) res.status(400).send({ message: 'Error during fetching allowed devices' });
    db.query('SELECT device_right.Device_IDDevice,device_right.User_IDUser,device.Name,device.UUID FROM `device_right` INNER JOIN device ON device.IDDevice = device_right.Device_IDDevice WHERE User_IDUser=?; ', [id])
      .then(result => {
        console.log(result);
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching devices' });
      })
  })
  // Get all device allowed for this user
  app.get('/user/alloweddevices', isAuthenticated, (req, res) => {
    const user = req.user
    const id = user.userID
    if (!id || isNaN(id)) { res.status(400).send({ message: 'Error during fetching allowed devices' }); return };
    db.query('SELECT device_right.Device_IDDevice,device_right.User_IDUser,device.Name,device.UUID FROM `device_right` INNER JOIN device ON device.IDDevice = device_right.Device_IDDevice WHERE User_IDUser=?; ', [id])
      .then(result => {
        console.log(result);
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching devices' });
      })
  })

  // Change user role
  app.post('/user/:id/changerole', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { role } = req.body
    if (!id || isNaN(id) || !role) res.status(400).send({ message: 'Error during changing role' });
    db.query('UPDATE user SET Role_IDRole = ? WHERE IDUser = ?', [role, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing role' });
      })
  })
  // Create a user with email, able to complete the account with password after, by email
  app.post('/user/create', isAuthenticated, isAdmin, (req, res) => {
    const { email, role } = req.body
    if (!email) { res.status(400).send({ message: 'Error during creating user' }); return }
    const defaultPassword = "1234"
    const hashedPassword = hashPassword(defaultPassword)
    // Crée un nouvelle utilisateur avec un email et un mot de passe par défaut, si l'email est non utilisé
    // Check if email is already used
    db.query('SELECT * FROM user WHERE Email = ?', [email])
      .then(result => {
        if (result.length) {
          res.status(400).send({ message: 'Email already used' });
          return
        }
        return hashedPassword
      })
      .then(hashedPassword => {
        if (!hashedPassword) return
        return db.query('INSERT INTO user (Email,Password,city,Role_IDRole,Rolecompany_id) VALUES (?,?,"",?,8)', [email, hashedPassword, role])
      })
      .then(result => {
        res.send({ message: 'Created', id: result.insertId })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during creating user' });
      })
  })

  // Change user email
  app.post('/user/:id/changeemail', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const { email } = req.body
    if (!id || isNaN(id) || !email) res.status(400).send({ message: 'Error during changing email' });
    db.query('UPDATE user SET Email = ? WHERE IDUser = ?', [email, id])
      .then(result => {
        res.send({ message: 'Updated' })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during changing email' });
      })
  })

  // Get all role name list
  app.get('/user/role/all', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM role; ')
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching roles' });
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
  return app
}
module.exports = { initUserRoutes };