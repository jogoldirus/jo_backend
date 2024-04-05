const { db } = require("../database.js");
const isAdminOrOwnAnalyse = async (req, res, next) => {
  try {
    const userID = req.user.userID

    // Vérifier si l'utilisateur est un administrateur
    await db.query('SELECT role.* FROM user INNER JOIN role ON role.IDRole = user.Role_IDRole WHERE user.IDUser = ?;', [userID])
      .then(result => {
        if (result && Array.isArray(result) && result.length === 1) {
          req.isAdmin = true
          next()
        }
        else throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", 403);
      })
      .catch(error => {
        throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", 403);
      })
  } catch (error) {
    // User is not an admin, check if he owns the device
    const analyseID = req.params.id
    const userID = req.user.userID
    if (!analyseID) throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification 2", 403)
    await db.query('SELECT id FROM measures_group WHERE id = ? AND Maker_IDUser = ?;', [analyseID, userID])
      .then(result => {
        if (result && Array.isArray(result) && result.length === 1) {
          req.isOwner = true
          next()
        }
        else throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", 403);
      })
      .catch(error => {
        console.log(error);
        throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", 403);
      })
    res.status(error?.status ? error.status : 456).send({ message: error.message });
  }

};
module.exports = isAdminOrOwnAnalyse;