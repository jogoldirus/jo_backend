// Importez les fonctions nécessaires à partir de votre fichier jwtFunctions.js
const { verifyToken } = require('../jwtFunctions');

// Middleware pour vérifier si l'utilisateur est authentifié
const isAuthenticated = async (req, res, next) => {
  // console.log("Checking if user is authenticated");
  try {
    // Récupérer le token du header 'Authorization'
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource sans authentification" });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const decoded = await verifyToken(token);  // Cette fonction devrait vérifier le token et retourner le payload décodé
    if (!decoded) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // Stocker les informations utilisateur dans req.user pour une utilisation ultérieure dans d'autres middlewares ou route handlers
    req.user = decoded;

    // Passer au prochain middleware ou route handler
    // console.log('User authenticated');
    next();
  } catch (error) {
    // Gestion des erreurs
    console.log(error);
    res.status(500).json({ message: error.message || 'Une erreur interne s\'est produite' });
  }
};

module.exports = isAuthenticated;
