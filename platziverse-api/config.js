'use strict'

const debug = require('debug')('platziverse:api:db')

module.exports = {
  db: {
    database: process.env.BD_NAME || 'platziverse',
    username: process.env.DB_USER || 'miorrowls',
    password: process.env.DB_PASS || '112358',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s)
  }
}
