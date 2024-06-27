import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import express from 'express';
import { db } from '../database.js';
import isAdmin from '../middlewares/isAdmin.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());


app.use((req, res, next) => {
  req.user = { userID: 1 };
  next();
});

app.get('/protected', isAdmin, (req, res) => {
  res.status(200).send({ message: 'Accès autorisé' });
});
app.get('/needlogin', isAuthenticated, (req, res) => {
  res.status(200).send({ message: 'Accès autorisé' });
});

describe('Middleware isAdmin', () => {
  let dbStub;

  beforeEach(() => { dbStub = sinon.stub(db, 'query'); });
  afterEach(() => { sinon.restore(); });

  it('Should only accept admin', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);

    const response = await supertest(app)
      .get('/protected')
      .expect(200);

    expect(response.body.message).to.equal('Accès autorisé');
  });

  it('Should deny when not admin', async () => {
    dbStub.resolves([[{ role: 'USER' }]]);

    const response = await supertest(app)
      .get('/protected')
      .expect(403);

    expect(response.body.message).to.equal("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification");
  });

  it('Should handle database error', async () => {
    const e = new Error('Database error');
    e.status = 456;
    dbStub.rejects(e);

    const response = await supertest(app)
      .get('/protected')
      .expect(456);

    expect(response.body.message).to.equal('Database error');
  });
});

describe('Middleware isAuthenticated ', () => {
  let verifyStub;

  beforeEach(() => {
    verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
      callback(null, { userID: 1 });
    });
  });
  afterEach(() => { sinon.restore(); });

  it('Should return 401 if no token is provided', async () => {
    const response = await supertest(app)
      .get('/needlogin')
      .expect(401);

    expect(response.body.message).to.equal("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification");
  });

  it('Should allow access if valid token is provided', async () => {
    const response = await supertest(app)
      .get('/needlogin')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.message).to.equal('Accès autorisé');
  });
})
