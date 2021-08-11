const fastify = require('fastify')({
  logger: {
    level: 'error',
  },
});

const crypto = require('crypto');
const metricsPlugin = require('fastify-metrics');
const mongoose = require('mongoose');

const { addInstance, log } = require('./utils/logger');

addInstance(fastify);

fastify.register(metricsPlugin, { endpoint: '/metrics' });

const database = require('./utils/database');

const port = process.env.PORT || '3000';
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/shorter';
const serviceURL = process.env.URL || 'http://localhost:3000';

const Short = require('./schemas/short');

const { Regexp } = require('./utils/regexp');

fastify.route({
  method: 'POST',
  url: '/api/short',
  schema: {
    body: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string' },
      },
    },
  },
  handler: async (request, reply) => {
    const { url } = request.body;
    const isURL = Regexp.url.test(url);

    if (!isURL) {
      reply.code(400);
      return { error_code: 1, error_msg: 'Provided URL doesnt look like URL' };
    }

    const urlCoded = Buffer.from(crypto.createHash('md5').update(url).digest('hex')).toString('base64');
    const shortedURL = urlCoded.substring(0, 12);

    const short = new Short({
      shorted: shortedURL,
      original: url,
    });

    try {
      await short.save();
    } catch (e) {
      reply.code(500);
      return { error_code: 3, error_msg: 'URL already shorted' };
    }

    return { shorted_url: `${serviceURL}/${shortedURL}` };
  },
});

fastify.route({
  method: 'GET',
  url: '/api/short',
  schema: {
    querystring: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'string' },
      },
    },
  },
  handler: async (request, reply) => {
    const { code } = request.query;

    const short = await Short.findOne({ shorted: code });

    if (!short) {
      reply.code(404);
      return { error_code: 2, error_msg: 'Short not found' };
    }

    return { shorted_url: `${serviceURL}/${short.shorted}`, original_url: short.original };
  },
});

fastify.route({
  method: 'GET',
  url: '/:code',
  schema: {
    params: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'string' },
      },
    },
  },
  handler: async (request, reply) => {
    const { code } = request.params;

    const short = await Short.findOne({ shorted: code });

    if (!short) {
      reply.code(404);
      return 'Not found';
    }

    return reply.redirect(short.original);
  },
});

const start = async () => {
  try {
    await fastify.listen(port);
  } catch (err) {
    log('error', err);
    process.exit(1);
  }
};

module.exports = { fastify, port };

database(mongoose, dbURL, start);

process.on('SIGINT', () => {
  fastify.close();

  mongoose.connection.close(() => {
    log('info', 'Database closed');
  });
});
