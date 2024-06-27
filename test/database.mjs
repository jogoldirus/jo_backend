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

describe('Database', () => {
  let poolStub;

  beforeEach(() => {
    poolStub = sinon.stub(db.pool, 'query');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should make a query to the database from pool', async () => {
    poolStub.yields(null, []);

    await db.query('SELECT * FROM test_table');
    expect(poolStub.calledOnce).to.be.true;
    expect(poolStub.calledWith('SELECT * FROM test_table')).to.be.true;
  });

  it('Should return rows on successful query', async () => {
    const rows = [{ id: 1, name: 'Test' }];
    poolStub.yields(null, rows);

    const result = await db.query('SELECT * FROM test_table');

    expect(result).to.deep.equal(rows);
  });

  it('Should throw error on failed query', async () => {

    const error = new Error('Database error');
    poolStub.yields(error, null);

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
  });

  it('Should return data from the endpoint', async () => {
    const rows = [{ id: 1, name: 'Test' }];
    poolStub.yields(null, rows);
    const response = await supertest(app).get('/data');
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(rows);
  });

  it('Should handle database error in endpoint', async () => {

    const error = new Error('Database error');
    poolStub.yields(error, null);
    const response = await supertest(app).get('/data');
    expect(response.status).to.equal(500);
    expect(response.body).to.deep.equal({ error: 'Database error' });
  });
});