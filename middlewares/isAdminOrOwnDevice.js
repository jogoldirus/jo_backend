const { db } = require("../database.js");
const isAdminOrOwnDevice = async (req, res, next) => {
  try {
    const userID = req.user.userID

    // Vérifier si l'utilisateur est un administrateur
    await db.query('SELECT role.* FROM user INNER JOIN role ON role.IDRole = user.Role_IDRole WHERE user.IDUser = ?;', [userID])
      .then(result => {
        if (result && Array.isArray(result) && result.length === 1 && Number(result[0].Level) <= 3) {
          req.isAdmin = true
          next()
        }
        else throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", 403);
      })
      .catch(error => {
        // console.log(error);
        throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", 403);
      })
  } catch (error) {
    // User is not an admin, check if he owns the device
    console.log('is not admin, check if he owns the device');
    const deviceID = req.params.id
    const userID = req.user.userID
    try {
      if (!deviceID) throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification 2", 403)
      await db.query('SELECT * FROM device_right WHERE Device_IDDevice = ? AND User_IDUser = ?;', [deviceID, userID])
        .then(result => {
          if (result && Array.isArray(result) && result.length === 1) {
            req.isOwner = true
            next()
          }
          else throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification de device", 403);
        })
        .catch(error => {
          console.log(error);
          throw new Error(error.message || "Not authorized", 403);
        })

    } catch (error) {

      res.status(error?.status ? error.status : 456).send({ message: error.message });
    }

  }

};
module.exports = isAdminOrOwnDevice;