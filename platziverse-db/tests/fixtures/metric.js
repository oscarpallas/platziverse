'use strict'

const agentFixtures = require('./agent')

const metric = {
  id: 1,
  type: 'metricFixture',
  value: 10,
  agentId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  agent: agentFixtures.findById(1)
}

const metrics = [
  metric,
  extend(metric, { id: 2, type: 'metricTest', agentId: 3, value: 30, agent: agentFixtures.findById(3) }),
  extend(metric, { id: 3, type: 'metricProve', value: 20 }),
  extend(metric, { id: 4, type: 'metricFake', agentId: 2, agent: agentFixtures.findById(2) })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  test: metrics.filter(m => m.type === 'metricFixture' && m.agent.uuid === 'yyy-yyy-yyy'),
  findById: id => metrics.filter(m => m.id === id).shift(),
  findByAgentId: agentId => metrics.filter(m => m.agentId === agentId).shift(),
  findByAgentUuid: uuid => metrics.filter(m => m.agent.uuid === uuid).shift(),
  findByTypeAgentUuid: (type, uuid) => metrics.filter(m => m.type === type && m.agent.uuid === uuid).shift()
}
