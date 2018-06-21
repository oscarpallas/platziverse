'use strict'

const proxy = require('./proxy')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const asyncify = require('express-asyncify')
const path = require('path')
const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const { pipe } = require('./utils')
const PlatziverseAgent = require('platziverse-agent')

const port = process.env.PORT || 8080
const app = asyncify(express())
const agent = new PlatziverseAgent()

const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

// Websockets
io.on('connect', socket => {
	debug(`Connected ${socket.id}`)

	pipe(agent, socket)
})

// Express Error Handler

app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} server listening on port ${port}`)
  agent.connect()
})
