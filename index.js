require('dotenv').config();
const express = require('express');
const { json, urlencoded } = require('express');
const https = require('http');
const cors = require('cors');
const { readFileSync } = require('fs');
const { db } = require('./database');
const { initAuthRoutes } = require('./routes/authRoute');
const { initOfferRoutes } = require('./routes/offerRoute');
const { initUserRoutes } = require('./routes/userRoute');


const app = express();
const port = process.env.PORT || 3000;
// Middleware pour parser le JSON
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}))
// For HTTPS 
const options = {
  // key: readFileSync(__dirname + '/' + process.env.PRIVKEY, 'utf8'),
  // cert: readFileSync(__dirname + '/' + process.env.CERT, 'utf8')
};
// Routes
const authRoutes = initAuthRoutes(db)
const offerRoutes = initOfferRoutes(db)
const userRoutes = initUserRoutes(db)

const isOnProd = process.env.DB_USERNAME === 'jo_prod';
let apiPrefix = isOnProd ? '' : '/apiV2'
app.get(apiPrefix, (req, res) => {
  res.send({ message: 'API Online' });
})
app.use(apiPrefix, [authRoutes, offerRoutes, userRoutes]);

const httpsServer = https.createServer(options, app);
// Démarrage du serveur
httpsServer.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}/apiV2`);
});