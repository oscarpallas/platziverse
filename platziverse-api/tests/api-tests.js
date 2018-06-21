'user strict'

const test = require('ava')
const util = require('util')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const config = require('../config')

const agentFixtures = require('./fixtures/agent')
const auth = require('../auth')
const sign = util.promisify(auth.sign)

let sandbox = null
let server = null
let dbStub = null
let token = null
let AgentStub = {}
let MetricStub = {}

let uuid = 'yyy-yyy-yyy'
let fakeUuid = 'aaa-aaa-aaa'

let type = 'memory'

let fakeType = 'fish'

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  dbStub = sandbox.stub()

  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentFixtures.findByUuid(uuid)))
  AgentStub.findByUuid.withArgs(fakeUuid).returns(Promise.resolve(null))

  token = await sign({admin: true, username: 'miorrowls'}, config.auth.secret)

  const api = proxyquire('../api', {
    'platziverse-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'Response body should be the same')
      t.end()
    })
})

test.serial.cb(`/api/agent/${uuid}`, t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.findByUuid(uuid))
      t.deepEqual(body, expected, 'Response body should be the same')
      t.end()
    })
})

test.serial.cb(`/api/agent/${fakeUuid}`, t => {
  request(server)
    .get(`/api/agent/${fakeUuid}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        console.log(err)
      }
      t.truthy(res.body.error, 'should return an error')
      t.regex(res.body.error, /not found/, 'Error should contains not found')
      t.end() // only work with callbacks cb()
    })
})


test.serial.todo('/api/agent/:uuid - not found')

test.serial.todo('/api/metrics/:uuid')
test.serial.todo('/api/metrics/:uuid - not found')

test.serial.todo('/api/metrics/:uuid/:type')
test.serial.todo('/api/metrics/:uuid/:type - not found')
