const knex = require('knex')({
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 2, max: 10 }
  });
  
  module.exports = knex;