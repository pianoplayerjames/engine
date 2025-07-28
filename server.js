import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import projectRoutes from './server/routes/projects.js'

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

// Register project routes
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
await server.listen({ port: 3000 })
