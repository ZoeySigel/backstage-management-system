import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const apiEntry = path.join(projectRoot, 'server/index.cjs')
const viteEntry = path.join(projectRoot, 'node_modules/vite/bin/vite.js')
const processes = []
let shuttingDown = false

const start = (name, command, args, env = {}) => {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: {
      ...process.env,
      ...env,
    },
    stdio: 'inherit',
  })

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return
    }

    shuttingDown = true
    stopAll(child)
    process.exit(code || (signal ? 1 : 0))
  })

  child.on('error', (error) => {
    if (!shuttingDown) {
      console.error(`[dev] ${name} failed to start: ${error.message}`)
      shuttingDown = true
      stopAll(child)
      process.exit(1)
    }
  })

  processes.push(child)
}

const stopAll = (except) => {
  for (const child of processes) {
    if (child !== except && !child.killed) {
      child.kill()
    }
  }
}

const shutdown = () => {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  stopAll()
}

start('api', process.execPath, [apiEntry], {
  API_PORT: process.env.API_PORT || '3000',
})
start('vite', process.execPath, [viteEntry, '--host', '127.0.0.1'])

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
