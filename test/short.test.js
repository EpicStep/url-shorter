const chai = require('chai');
const chaiHTTP = require('chai-http');

const { log } = require('../utils/logger');

const should = chai.should();
const mongoose = require('mongoose');
const { fastify, port } = require('../app');

const Short = require('../schemas/short');

chai.use(chaiHTTP);

before(async () => {
  await Short.deleteMany({});
});

after(() => {
  fastify.close();

  mongoose.connection.close(() => {
    log('info', 'Database closed');
  });
});

describe('/POST /api/short', () => {
  it('should create short URL', (done) => {
    const s = {
      url: 'https://google.com/',
    };

    chai.request(`http://localhost:${port}`).post('/api/short')
      .send(s)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('shorted_url').eql('http://localhost:3000/ZjgyNDM4YTk4');
        done();
      });
  });
});

describe('/GET /api/short', () => {
  it('should get url by short code', (done) => {
    chai.request(`http://localhost:${port}`).get('/api/short')
      .query({ code: 'ZjgyNDM4YTk4' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('shorted_url').eql('http://localhost:3000/ZjgyNDM4YTk4');
        res.body.should.have.property('original_url').eql('https://google.com/');
        done();
      });
  });
});

describe('/GET /:code', () => {
  it('should redirect to original URL', (done) => {
    chai.request(`http://localhost:${port}`).get('/ZjgyNDM4YTk4')
      .end((err, res) => {
        res.should.have.status(200);
        res.redirects.length.should.be.greaterThan(0);
        done();
      });
  });
});
