const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')
const ts = require('typescript')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const MOCK_DIR = path.join(PROJECT_ROOT, 'mock')
const HOST = process.env.API_HOST || '127.0.0.1'
const PORT = Number(process.env.API_PORT || process.env.PORT || 3000)

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  })

  module._compile(output.outputText, filename)
}

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  })
  res.end(JSON.stringify(data))
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ''

    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const compilePath = (url) => {
  const paramNames = []
  const pattern = url
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1))
        return '([^/]+)'
      }

      return escapeRegExp(segment)
    })
    .join('/')

  return {
    paramNames,
    regex: new RegExp(`^${pattern}/?$`),
  }
}

const loadRoutes = () => {
  const routeFiles = fs
    .readdirSync(MOCK_DIR)
    .filter((file) => file.endsWith('.ts'))
    .sort()

  return routeFiles.flatMap((file) => {
    const modulePath = path.join(MOCK_DIR, file)
    const routeModule = require(modulePath)
    const routes = routeModule.default || routeModule

    return routes.map((route) => {
      const compiledPath = compilePath(route.url)

      return {
        ...route,
        method: route.method.toUpperCase(),
        paramNames: compiledPath.paramNames,
        regex: compiledPath.regex,
        source: file,
      }
    })
  })
}

const routes = loadRoutes()

const findRoute = (pathname, method) => {
  for (const route of routes) {
    if (route.method !== method) {
      continue
    }

    const match = pathname.match(route.regex)

    if (match) {
      return {
        route,
        params: Object.fromEntries(
          route.paramNames.map((name, index) => [name, decodeURIComponent(match[index + 1])]),
        ),
      }
    }
  }

  return undefined
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, null)
    return
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`)

  if (requestUrl.pathname === '/api/health') {
    sendJson(res, 200, { code: 200, data: { status: 'ok' }, message: 'success' })
    return
  }

  const matched = findRoute(requestUrl.pathname, req.method || 'GET')

  if (!matched) {
    sendJson(res, 404, {
      code: 404,
      data: null,
      message: `Route not found: ${req.method} ${requestUrl.pathname}`,
    })
    return
  }

  try {
    const body = await readBody(req)
    const query = Object.fromEntries(requestUrl.searchParams.entries())
    const response =
      typeof matched.route.response === 'function'
        ? await matched.route.response({
            body,
            headers: req.headers,
            query: {
              ...query,
              ...matched.params,
            },
          })
        : matched.route.response

    sendJson(res, 200, response)
  } catch (error) {
    sendJson(res, 500, {
      code: 500,
      data: null,
      message: error instanceof Error ? error.message : 'Internal server error',
    })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`[api] Node.js service running at http://${HOST}:${PORT}`)
  console.log(
    `[api] Registered ${routes.length} routes from ${path.relative(PROJECT_ROOT, MOCK_DIR)}`,
  )
})

const shutdown = () => {
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
