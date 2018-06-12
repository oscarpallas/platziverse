'use strict'

const debug = require('debug')('platziverse:db:setup')
const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'miorrowls',
    password: process.env.DB_PASS || '112358',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s)
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy-yyy-yyt',
    name: 'Oscar',
    username: 'Bearrowls',
    hostname: 'host-test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  const agents = await Agent.findAll().catch(handleFatalError)

  const metric = await Metric.create(agent.uuid, {
  	type: 'memory',
  	value: '300'
  }).catch(handleFatalError)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

run()
