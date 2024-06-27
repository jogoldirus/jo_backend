const { db } = require('../database');
// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = async (req, res, next) => {
  try {
    const userID = req.user.userID;

    // Vérifier si l'utilisateur est un administrateur
    const [result] = await db.query('SELECT user.role FROM user WHERE user.id = ? AND user.role = "ADMIN"', [userID]);

    if (result && Array.isArray(result) && result.length === 1 && result[0].role === 'ADMIN') {
      req.isAdmin = true;
      next();
    } else {
      throw { message: "Vous n'êtes pas autorisé à accéder à cette ressource sans authentification", status: 403 };
    }
  } catch (error) {
    // console.error(error);
    res.status(error.status || 500).send({ message: error.message, code: error.code || 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = isAdmin;
