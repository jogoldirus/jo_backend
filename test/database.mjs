import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import express from 'express';
import { db } from '../database.js'; // Assurez-vous que ce chemin est correct

// Créer une application Express pour les tests
const app = express();
app.use(express.json());

app.get('/data', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM test_table');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Définir les tests
describe('Database', () => {
  let dbStub;

  beforeEach(() => { dbStub = sinon.stub(db, 'query'); });
  afterEach(() => { sinon.restore(); });

  it('Should return rows on successful query', async () => {
    const rows = [{ id: 1, name: 'Test' }];
    dbStub.resolves(rows);

    const result = await db.query('SELECT * FROM test_table');
    expect(result).to.deep.equal(rows);
  });

  it('Should throw error on failed query', async () => {
    const error = new Error('Database error');
    dbStub.rejects(error);

    try {
      await db.query('SELECT * FROM test_table');
    } catch (err) {
      expect(err).to.equal(error);
    }
  });

  it('Should close the database connection', async () => {
    const closeStub = sinon.stub(db.pool, 'end').callsFake(callback => callback());
    await db.close();
    expect(closeStub.calledOnce).to.be.true;
    closeStub.restore();
  });

  it('Should return data from the endpoint', async () => {
    const rows = [{ id: 1, name: 'Test' }];
    dbStub.resolves(rows);

    const response = await supertest(app).get('/data');
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(rows);
  });

  it('Should handle database error in endpoint', async () => {
    dbStub.rejects(new Error('Database error'));

    const response = await supertest(app).get('/data');
    expect(response.status).to.equal(500);
    expect(response.body).to.deep.equal({ error: 'Database error' });
  });
});