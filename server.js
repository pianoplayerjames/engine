import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import projectRoutes from './server/routes/projects.js'

const isElectron = process.env.ELECTRON_MODE === 'true'
const port = process.env.PORT || 3000

const server = Fastify()

await server.register(projectRoutes)

await server.register(FastifyVite, {
  root: import.meta.dirname,
  renderer: '@fastify/react',
})

server.setErrorHandler((error, req, reply) => {
  console.error(error)
  reply.send({ error })
})

await server.vite.ready()

const listenOptions = {
  port: port,
  host: isElectron ? '127.0.0.1' : '0.0.0.0'
}

server.listen(listenOptions)

if (isElectron) {
  console.log(`🚀 Server running in Electron mode on http://127.0.0.1:${port}`)
} else {
  console.log(`🚀 Server running on http://localhost:${port}`)
}