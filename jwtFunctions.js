const { config } = require('dotenv');
config();
const SECRET_KEY = process.env.SECRET_JWT;  // Choisissez une clé secrète forte
const jwt = require('jsonwebtoken');
const { sign, verify } = jwt;

async function generateToken({ email, userID }) {
  if (!userID || !email) throw new Error('Missing payload');
  const payload = { userID, email };  // Vous pouvez stocker des informations utiles dans le payload
  const token = await sign(payload, SECRET_KEY, { expiresIn: '24h' });
  return token;
}
async function verifyToken(token) {
  if (!token) throw new Error('Missing token');
  return await verify(token, SECRET_KEY);
}
module.exports = { generateToken, verifyToken }