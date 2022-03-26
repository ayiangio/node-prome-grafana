const http = require('http')
const url = require('url')
const client = require('prom-client')
const { Console } = require('console')

const register = new client.Registry()
register.setDefaultLabels({
  app: 'nodejs-app'
})
client.collectDefaultMetrics({ register })
const counter = new client.Counter({
  name: 'node_my_counter',
  help: 'This is my counter',
  labelNames: ['code'],
});

setInterval(() => {
  counter.inc({ code: 200 });
  counter.inc();
  counter.reset();
  counter.inc(15);
  counter.inc({ code: 200 }, Math.random());
  counter.labels('200').inc(Math.random());
}, 5000);
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})
register.registerMetric(httpRequestDurationMicroseconds)

register.registerMetric(counter)

const server = http.createServer(async (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer()
  const route = url.parse(req.url).pathname

  if (route === '/metrics') {
    res.setHeader('Content-Type', register.contentType)
    res.end(await register.metrics())
  }

  if (route == '/welcome') {
    result = {
      "Message" : `Welcome To this API AYI`,
      "Status Code" : 200,
    }
    await register.metrics()
    res.end(JSON.stringify(result))
  }
  end({ route, code: res.statusCode, method: req.method })
})
server.listen(8080)