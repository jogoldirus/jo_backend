const { config } = require('dotenv');
config();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_JWT;

async function generateToken({ email, userID, name, forename }) {
  if (!userID || !email) throw new Error('Missing payload');
  const payload = { userID, email, name, forename };
  const token = await jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
  return token;
}
async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    if (!token) reject(new Error('Missing token'));
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
}
async function decodeToken(token) {
  if (!token) throw new Error('Missing token');
  return await jwt.decode(token);
}
module.exports = { generateToken, verifyToken, decodeToken }