const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const isAdminOrOwnDevice = require('../middlewares/isAdminOrOwnDevice');
const express = require('express');

function initDeviceRoutes(db) {
  const app = express.Router()
  // Get all devices

  app.get("/device/:id/testing", isAuthenticated, isAdminOrOwnDevice, (req, res) => {
    res.send({ message: 'OK' });
  })
  app.get('/device/all', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM device; ')
      .then(result => { res.send(result); })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching devices' });
      })
  })
  // Create a deivice
  app.post('/device/create', isAuthenticated, isAdmin, (req, res) => {
    const { name, uuid, email } = req.body
    if (!name || !uuid || !email) { res.status(400).send({ message: 'Error during creating device : Wrong parameters' }); return }
    db.query('INSERT INTO device (Name, UUID) VALUES (?,?)', [name, uuid])
      .then(result => {
        const idDevice = result.insertId
        // Add right to email
        db.query('INSERT INTO device_right (User_IDUser, Device_IDDevice,OwningLevel,OwnerId) VALUES ((SELECT IDUser FROM user WHERE Email = ?),?,1,?)', [email, idDevice, req.user.userID])
          .then(result => { res.send({ message: 'Created', id: idDevice }) })
          .catch(err => {
            console.log(err);
            res.status(400).send({ message: 'Error during creating device' });
          })
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during creating device' });
      })
  })
  // Delete a device
  app.delete('/device/:id', isAuthenticated, isAdmin, (req, res) => {
    const ids = req.params.id ? req.params.id.split("|") : null;
    if (!ids) res.status(400).send({ message: 'Error during deleting device' });
    if (ids) {
      db.query('DELETE FROM device WHERE IDDevice IN (?)', [ids])
        .then(result => {
          res.send({ message: 'Deleted' })
        })
        .catch(err => {
          console.log(err);
          res.status(400).send({ message: 'Error during deleting analyse' });
        })
    }
  })
  // Get all method's device ( Minimum Admin )
  app.get('/device/:id/methods', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    db.query('SELECT method.IDMethod,method.Name,method.IDMethod,device_method.IDDevice_method FROM method LEFT JOIN device_method ON device_method.Method_IDMethod = method.IDMethod AND device_method.Device_IDDevice = ? GROUP BY method.IDMethod, method.Name; ', [id])
      .then(result => { res.send(result); })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching methods' });
      })
  })
  // Get all device's methods detailled ( Minimum Admin + Own Device)
  app.get('/device/:id/methods/detailled', isAuthenticated, isAdminOrOwnDevice, (req, res) => {
    const id = req.params.id
    const { userID } = req.user
    if (!userID) res.status(400).send({ message: 'Error during fetching methods' });
    db.query(`SELECT method.IDMethod,method.Name,method.Volume,method.Algo,(SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT("MethodParameterGroupID", mgp.id,"ParameterGroupName", mgp.name) SEPARATOR ', '), ']') as JSON_Result FROM method_groupparameter mgp WHERE mgp.method_ID = method.IDMethod) as ParameterGroup FROM method INNER JOIN device_method ON device_method.Device_IDDevice = ? && device_method.Method_IDMethod = method.IDMethod INNER JOIN device_right ON device_right.Device_IDDevice = ? && device_right.User_IDUser= ?; `, [id, id, userID])
      .then(result => { res.send(result); })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching methods' });
      })
  })
  // Get all device allowed's users to use it
  app.get('/device/:id/allowedusers', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    db.query('SELECT user.IDUser,user.Email,device_right.Device_IDDevice FROM user INNER JOIN device_right ON device_right.User_IDUser = user.IDUser AND device_right.Device_IDDevice = ?; ', [id])
      .then(result => { res.send(result); })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during fetching device users' });
      })
  })
  // Add new user from device allowed users
  app.post('/device/:id/allowedusers/add', isAuthenticated, isAdmin, async (req, res) => {
    const id = req.params.id
    const email = req.body.email
    const { userID: addedID } = req.user // Of the user who is adding the new user
    // console.log(decoded);
    // res.send({ message: 'Added' });
    // return
    if (!email) { res.status(400).send({ message: 'Error during adding users' }); return }
    const idUser = await db.query('SELECT IDUser FROM user WHERE Email = ?', [email]).then(result => result[0].IDUser).catch(err => { return undefined })
    if (!idUser) { res.status(400).send({ message: 'User do not exist' }); return }

    db.query('INSERT INTO device_right (User_IDUser, Device_IDDevice,OwningLevel,OwnerId) VALUES (?,?,1,?)', [idUser, id, addedID])
      .then(result => { res.send({ message: 'Added', idUser }); return })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during adding users' });
      })
  })
  // Remove user from allowed users
  app.post('/device/:id/allowedusers/remove', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const idUser = req.body.idUser
    if (!idUser) { res.status(400).send({ message: 'Error during removing users' }); return }
    db.query('DELETE FROM device_right WHERE User_IDUser IN (?) AND Device_IDDevice = ?', [idUser, id])
      .then(result => { res.send({ message: 'Removed' }); return })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during removing users' });
      })
  })
  // Update device methods Add or Delete
  app.post('/device/:id/methods/update', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const methods = req.body.changedMethod
    if (!methods) { res.status(400).send({ message: 'Error during updating methods' }); return }
    // [ { IDMethod: 1, IDDevice_method: null, action: 'add' } ] where IDMethod is the method ID, IDDevice_method the id to delete if needed
    const toAdd = methods.filter(method => method.action === 'add')
    const toDelete = methods.filter(method => method.action === 'remove')
    const promises = []
    const insertedId = []
    const deletedId = []
    if (toAdd.length) {
      toAdd.forEach(method => {
        const promise = db.query('INSERT INTO device_method (Device_IDDevice, Method_IDMethod) VALUES (?,?)', [id, method.IDMethod])
          .then(result => {
            insertedId.push({ id: method.IDMethod, insertId: result.insertId }); // Stocker l'ID inséré
            return result; // Continue avec la promesse
          });
        promises.push(promise);
      });
    }
    if (toDelete.length) {
      toDelete.forEach(method => {
        console.log(method);
        const promise = db.query('DELETE FROM device_method WHERE IDDevice_method = ?', [method.IDDevice_method])
          .then(result => {
            deletedId.push(method.IDDevice_method); // Stocker l'ID supprimé
            return result; // Continue avec la promesse
          });
        promises.push(promise);
      });
    }
    Promise.all(promises)
      .then(result => { res.send({ message: 'Updated', insertedId, deletedId }); return })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during updating methods', insertedId, deletedId });
      })
  })
  // Update device UUID
  app.post('/device/:id/uuid', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id
    const uuid = req.body.UUID
    if (!uuid) { res.status(400).send({ message: 'Error during updating UUID' }); return }
    db.query('UPDATE device SET UUID = ? WHERE IDDevice = ?', [uuid, id])
      .then(result => { res.send({ message: 'Updated' }); return })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during updating UUID' });
      })
  })
  return app
}

module.exports = { initDeviceRoutes };