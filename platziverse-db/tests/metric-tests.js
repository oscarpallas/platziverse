'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

let config = {
  logging: function () {}
}

let AgentStub = {
  hasMany: sinon.spy()
}

// let single = Object.assign({}, metricFixtures.single)

let id = 1

let uuid = 'yyy-yyy-yyy'

let type = 'metricFixture'

let newMetric = {
  type: 'newMetric',
  value: 40,
  agentId: 1
}

let agentId = agentFixtures.findByUuid(uuid).id

let agentIdArgs = {
  where: { agentId }
} 

let metricUuidArgs = {
  attributes: [ 'type' ],
  group: [ 'type' ],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let metricTypeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
      where: {
        type
      },
      limit: 20,
      order: ['createdAt', 'DESC'],
      include: [{
        attributes: [],
        model: AgentStub,
        where: {
          uuid
        }
      }],
      raw: true
}

let typeArgs = {
  where: { type: 'metricTest' }
}

let uuidAgentArgs = {
  where: {
    uuid
  }
}

let MetricStub = null

let db = null

let sandbox = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sandbox.spy()
  }

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))

  MetricStub.findById = sandbox.stub()
  MetricStub.findById.withArgs(id).returns(Promise.resolve(metricFixtures.findById(id)))

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidAgentArgs).returns(Promise.resolve(agentFixtures.findByUuid(uuid)))

  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))
  MetricStub.findAll.withArgs(metricUuidArgs).returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))
  MetricStub.findAll.withArgs(metricTypeUuidArgs).returns(Promise.resolve(metricFixtures.test))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Metric#findByAgentUuid', async t => {

  let metrics = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'findAll should be called with an agent uuid')

  t.deepEqual(metrics, metricFixtures.findByAgentUuid(uuid), 'Should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {

  let metric = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(metricTypeUuidArgs), 'findAll should be called with type and uuid')

  t.deepEqual(JSON.stringify(metric).substr(1).slice(0, -1), JSON.stringify(metricFixtures.findByTypeAgentUuid(type, uuid)), 'Should be the same')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidAgentArgs), 'findOne should be called with an uuid')
  t.true(MetricStub.create.called, 'Create should be called on model')
  t.true(MetricStub.create.calledOnce, 'Create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'Create should be called with new agent')

  t.deepEqual(metric, newMetric, 'Metric should be the same')
})

