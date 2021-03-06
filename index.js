const got = require('got')
const { get } = require('env-var')
const { CloudEvent, HTTP } = require('cloudevents')

const fastify = require('fastify')({ logger: true })
const BROKER_URL = get('BROKER_URL').default('http://broker-ingress.knative-eventing.svc.cluster.local/knative-eventing/default').asUrlString()
const HTTP_PORT = get('HTTP_PORT').default(8080).asPortNumber()
console.log('broker URL', BROKER_URL)
fastify.get('/', async (req, reply) => {
  const ce = new CloudEvent({
    type: 'event-type',
    data: {
      hello: 'world'
    },
    source: 'fastify-http-server'
  })
  const message = HTTP.binary(ce)

  fastify.log.info('sending cloud event %j', message)
  const response = await got(BROKER_URL, {
    method: 'POST',
    body: message.body,
    headers: message.headers
  })

  console.log('got response status:', response.statusCode)
  console.log('got response body:', response.body)

  reply.send('ok')
})

fastify.post('/example', (req, reply) => {
  reply.send('OK')
})

const start = async () => {
  try {
    await fastify.listen(HTTP_PORT, '0.0.0.0')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
