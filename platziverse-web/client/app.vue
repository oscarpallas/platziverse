<template>
  <div>
  <metric uuid="fe5d876a-e9d3-464b-a69f-37d5107d1ef2" type="rss"></metric>
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>

<script>
module.exports = {
  data () {
    return {
      agents: [],
      error: null
    }
  },
  mounted () {
    this.initialize()
  },
  methods: {
    initialize () {
    }
  }
}
</script>