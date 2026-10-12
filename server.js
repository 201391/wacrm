// Hostinger hPanel Node.js Application Startup File
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const rawPort = process.env.PORT
const port = rawPort ? (isNaN(Number(rawPort)) ? rawPort : parseInt(rawPort, 10)) : 3000

const app = next({ dev, hostname, port: typeof port === 'number' ? port : 3000 })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error handling request:', req.url, err)
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    }).listen(port, () => {
      console.log(`> Ready on ${typeof port === 'string' ? port : `http://${hostname}:${port}`}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
