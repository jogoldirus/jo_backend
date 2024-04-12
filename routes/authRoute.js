
const argon2 = require('argon2');
const { generateToken, verifyToken } = require('../jwtFunctions');
// Hacher un mot de passe

const express = require('express');
async function hashPassword(password) {
  try {
    const hashedPassword = await argon2.hash(password);
    console.log(hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('Erreur lors du hachage du mot de passe:', error);
    throw error;
  }
}
function initAuthRoutes(db) {
  const app = express.Router();
  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).send({ message: 'Missing fields' }); return; }
    db.query('SELECT user.id,user.name,user.forename,user.password FROM user WHERE email = ?', [email])
      .then(async result => {
        if (!result.length) { res.status(400).send({ message: 'Email not found' }); return; }
        const user = result[0];
        const hash = await hashPassword(password);
        // console.log(hash, user.Password);
        const match = await checkPassword(password, user.password);
        if (!match) { res.status(400).send({ message: 'Wrong password' }); return; }
        const token = await generateToken({ email, userID: user.id });
        res.send({ message: 'Logged in', token, payload: { email, userID: user.id, name: user.name, forename: user.forename } });

      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during login' });
      })
  })
  // signup
  app.post('/auth/signup', async (req, res) => {
    const { email, password, name, forename, confirmPassword } = req.body;
    console.log(req.body, { email, password, confirmPassword, name, forename });
    if (email === '' || password === '' || confirmPassword === '' || name === '' || forename === '') { res.status(400).send({ message: 'Missing fields' }); return; }
    if (password !== confirmPassword) { res.status(400).send({ message: 'Wrong password' }); return; }
    const hash = await hashPassword(password);
    db.query('INSERT INTO user (email, password,name,forename) VALUES (?,?,?,?)', [email, hash, name, forename])
      .then(async result => {
        const insertedID = result.insertId;
        const token = await generateToken({ email, userID: insertedID });
        res.send({ message: 'Account created', token, payload: { email, userID: insertedID, name, forename } });
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Error during signup' });
      })
  })

  app.post('/auth/verifyToken', (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) { res.status(400).send({ message: 'Missing token' }); return; }
    verifyToken(token)
      .then(result => {
        res.send({ message: 'Token is valid', result });
      })
      .catch(err => {
        console.log(err);
        res.status(400).send({ message: 'Invalid token' });
      })
  })


  // Vérifier un mot de passe
  async function checkPassword(inputPassword, hashedPassword) {
    try {
      const match = await argon2.verify(hashedPassword, inputPassword);
      return match;
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe:', error);
      throw error;
    }
  }
  return app
}
module.exports = { initAuthRoutes, hashPassword };