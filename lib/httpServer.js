const util = require('util')

const Koa = require('koa')
const body = require('koa-body')
const cors = require('@koa/cors')
const route = require('koa-route')
const static_ = require('koa-static')

const opts = require('minimist')(process.argv.slice(2))

const log = () => async (context, next) => {
  const requestBody = util.inspect(context.request.body)
  console.log(`<- ${context.url} ${requestBody}`)
  await next()
  const responseBody = util.inspect(context.body)
  console.log(`-> ${context.url} ${responseBody}`)
}

const client = () => async (context, next) => {
  context.state.client = await context.room.connect()
  await next()
  context.state.client.disconnect()
}

const assert = async context => {
  const {fact} = context.request.body
  await context.state.client.assert(fact)
}

const retract = async context => {
  const {fact} = context.request.body
  await context.state.client.retract(fact)
}

const select = async context => {
  const {facts} = context.request.body
  await context.state.client
    .select(facts)
    .doAll(solutions => {
      context.body = { solutions }
    })
}

const facts = async context => {
  context.body = context.room.client.facts
}

const app = new Koa()
app.use(cors())
app.use(body())
if (opts.verbose) {
  app.use(log())
}
app.use(client())
app.use(route.post('/assert', assert))
app.use(route.post('/select', select))
app.use(route.post('/retract', retract))
app.use(route.post('/facts', facts))
app.use(static_('examples'))

module.exports = room => {
  app.context.room = room
  return app
}
