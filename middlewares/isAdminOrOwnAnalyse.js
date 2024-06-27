const { db } = require("../database.js");

const isAdminOrOwnAnalyse = async (req, res, next) => {
  try {
    const userID = req.user.userID;

    // Vérifier si l'utilisateur est un administrateur
    const adminResult = await db.query('SELECT role.* FROM user INNER JOIN role ON role.IDRole = user.Role_IDRole WHERE user.IDUser = ?;', [userID]);
    if (adminResult && Array.isArray(adminResult) && adminResult.length === 1) {
      const userRole = adminResult[0]?.role;
      if (userRole === 'ADMIN') {
        req.isAdmin = true;
        return next();
      } else {
        req.isAdmin = false;
      }
    }

    // Si l'utilisateur n'est pas un administrateur, vérifier s'il est le propriétaire de l'analyse
    const analyseID = req.params.id;
    if (!analyseID) {
      return res.status(403).send({ message: "Vous n'êtes pas autorisé à accéder à cette ressource sans authentification" });
    }

    const ownerResult = await db.query('SELECT id FROM measures_group WHERE id = ? AND Maker_IDUser = ?;', [analyseID, userID]);
    if (ownerResult && Array.isArray(ownerResult) && ownerResult.length === 1 && Number(ownerResult[0].id) === Number(analyseID)) {
      req.isOwner = true;
      return next();
    }

    // Si l'utilisateur n'est ni administrateur ni propriétaire de l'analyse
    return res.status(403).send({ message: "Vous n'êtes pas autorisé à accéder à cette ressource sans authentification" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Erreur du serveur" });
  }
};

module.exports = isAdminOrOwnAnalyse;
