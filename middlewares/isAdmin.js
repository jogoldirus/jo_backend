// Importez les fonctions nécessaires à partir de votre fichier jwtFunctions.js
const { db } = require("../database.js");
// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = async (req, res, next) => {
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
        console.log(error);
        throw new Error("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", 403);
      })
  } catch (error) {
    // Gestion des erreurs
    res.status(error?.status ? error.status : 456).send({ message: error.message });
  }
};

module.exports = isAdmin;
