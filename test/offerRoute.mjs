import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import express from 'express';
import { db } from '../database.js';
import app from '../index.js';
import jwt from 'jsonwebtoken';


const testApp = express();
testApp.use(express.json());


app.use((req, res, next) => {
  req.user = { userID: 1 };
  next();
});
testApp.use('/api', app);

describe('GET offers', () => {
  let dbStub;

  beforeEach(() => { dbStub = sinon.stub(db, 'query'); });
  afterEach(() => { sinon.restore(); });

  it('Should return offers list', async () => {
    dbStub.resolves([{ id: 1, name: 'Offer 1' }, { id: 2, name: 'Offer 2' }]);

    const response = await supertest(app)
      .get('/api/offers')
      .expect(200);

    expect(response.body).to.be.an('array');
    expect(response.body.length).to.equal(2);
    expect(response.body[0].name).to.equal('Offer 1');
    expect(response.body[1].name).to.equal('Offer 2');
  });

  it('Should handle database error', async () => {
    dbStub.rejects(new Error('Database error'));

    const response = await supertest(app)
      .get('/api/offers')
      .expect(500);

    expect(response.body.message).to.equal('Database error');
  });
});
describe('POST change offer name', () => {
  let dbStub;

  beforeEach(() => {
    dbStub = sinon.stub(db, 'query');
    sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
      callback(null, { userID: 1 });
    });
  });

  afterEach(() => { sinon.restore(); });

  it('Should only accept admin', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);

    const response = await supertest(app)
      .post('/api/offer/1/changename')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'New name' })
      .expect(200);

    expect(response.body.message).to.equal('Name changed');
  });
  it('Should only accept connected user', async () => {
    // Configurer le stub pour retourner un rôle ADMIN
    dbStub.resolves([[{ role: 'ADMIN' }]]);
    const response = await supertest(app)
      .post('/api/offer/1/changename')
      .send({ name: 'New name' })
      .expect(401);

    expect(response.body.message).to.equal("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification");
  });
});


describe('POST create new offer', () => {
  let dbStub;

  beforeEach(() => {
    dbStub = sinon.stub(db, 'query');
    sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
      callback(null, { userID: 1 });
    });
  });

  afterEach(() => { sinon.restore(); });

  it('Should only accept admin', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);

    const response = await supertest(app)
      .post('/api/offer/create')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'E', price: 10, description: 'description', eventID: 1, placeInclude: 1, color: "red" })
      .expect(200);

    expect(response.body.message).to.equal('Offer created');
  });
  it('Should reject non-admin', async () => {
    dbStub.resolves([[{ role: 'USER' }]]);

    const response = await supertest(app)
      .post('/api/offer/create')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'E', price: 10, description: 'description', eventID: 1, placeInclude: 1, color: "red" })
      .expect(403);

    expect(response.body.message).to.equal("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification");
  });
  it('Should only accept connected user', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);
    const response = await supertest(app)
      .post('/api/offer/create')
      .send()
      .expect(401);

    expect(response.body.message).to.equal("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification");
  });
  it('Should handle missing fields', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);
    const response = await supertest(app)
      .post('/api/offer/create')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'E', price: 10, description: 'description', eventID: 1, placeInclude: 1 })
      .expect(400);

    expect(response.body.message).to.equal('Missing fields');
  });
});

describe('POST delete offer', () => {
  let dbStub;

  beforeEach(() => {
    dbStub = sinon.stub(db, 'query');
    sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
      callback(null, { userID: 1 });
    });
  });

  afterEach(() => { sinon.restore(); });

  it('Should only accept admin', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);

    const response = await supertest(app)
      .delete('/api/offer/1')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.message).to.equal('Deleted');
  });
  it('Should reject non-admin', async () => {
    dbStub.resolves([[{ role: 'USER' }]]);

    const response = await supertest(app)
      .delete('/api/offer/1')
      .set('Authorization', 'Bearer valid-token')
      .expect(403);

    expect(response.body.message).to.equal("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification");
  });
  it('Should only accept connected user', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);
    const response = await supertest(app)
      .delete('/api/offer/1')
      .expect(401);

    expect(response.body.message).to.equal("Vous n'êtes pas autorisé à accéder à cette ressource sans authentification");
  });
  it('Should handle missing fields', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);
    const response = await supertest(app)
      .delete('/api/offer/')
      .set('Authorization', 'Bearer valid-token')
      .expect(404);
  });
  it('Should support multiple ids', async () => {
    dbStub.resolves([[{ role: 'ADMIN' }]]);
    const response = await supertest(app)
      .delete('/api/offer/1|2|3')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
  });
});