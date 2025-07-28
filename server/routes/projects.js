import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Projects directory relative to server root
const PROJECTS_DIR = path.join(__dirname, '../../projects')

// Ensure projects directory exists
async function ensureProjectsDir() {
  try {
    await fs.access(PROJECTS_DIR)
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true })
  }
}

export default async function projectRoutes(fastify) {
  // Ensure projects directory exists on startup
  await ensureProjectsDir()

  // Create new project
  fastify.post('/api/projects/create', async (request, reply) => {
    try {
      const { projectName } = request.body
      
      if (!projectName || typeof projectName !== 'string') {
        return reply.code(400).send({ error: 'Project name is required' })
      }

      // Sanitize project name
      const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const projectPath = path.join(PROJECTS_DIR, safeName)

      // Check if project already exists
      try {
        await fs.access(projectPath)
        return reply.code(409).send({ error: 'Project already exists' })
      } catch {
        // Project doesn't exist, continue
      }

      // Create project directory structure
      await fs.mkdir(projectPath, { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'textures'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'models'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'audio'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'scripts'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'scenes'), { recursive: true })

      // Create default project metadata
      const projectInfo = {
        name: projectName,
        version: '1.0.0',
        engineVersion: '0.1.0',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }

      await fs.writeFile(
        path.join(projectPath, 'project.json'),
        JSON.stringify(projectInfo, null, 2)
      )

      // Create default scene
      const defaultScene = {
        entities: {
          "1": {
            id: 1,
            name: "Scene_1",
            active: true,
            parent: null,
            children: [],
            components: ["transform"]
          }
        },
        components: {
          transform: {
            "1": { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }
          }
        },
        sceneObjects: [
          {
            id: 'cube-1',
            name: 'Cube',
            type: 'mesh',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            geometry: 'box',
            material: { color: 'orange' },
            visible: true
          }
        ],
        entityCounter: 1,
        sceneRoot: 1
      }

      await fs.writeFile(
        path.join(projectPath, 'scenes', 'main.json'),
        JSON.stringify(defaultScene, null, 2)
      )

      reply.send({
        success: true,
        projectPath: safeName,
        projectName: projectName
      })

    } catch (error) {
      console.error('Error creating project:', error)
      reply.code(500).send({ error: 'Failed to create project' })
    }
  })

  // Load project
  fastify.get('/api/projects/:projectName', async (request, reply) => {
    try {
      const { projectName } = request.params
      const projectPath = path.join(PROJECTS_DIR, projectName)

      // Check if project directory exists
      try {
        await fs.access(projectPath)
      } catch {
        return reply.code(404).send({ error: 'Project not found' })
      }

      // Read project metadata
      const projectInfoPath = path.join(projectPath, 'project.json')
      let projectInfo
      try {
        projectInfo = JSON.parse(await fs.readFile(projectInfoPath, 'utf8'))
      } catch {
        return reply.code(404).send({ error: 'Project metadata not found' })
      }

      // Read main scene
      const mainScenePath = path.join(projectPath, 'scenes', 'main.json')
      let sceneData = {}
      try {
        sceneData = JSON.parse(await fs.readFile(mainScenePath, 'utf8'))
      } catch {
        // Scene file doesn't exist, use empty scene
      }

      // Read editor settings
      const editorSettingsPath = path.join(projectPath, 'editor-settings.json')
      let editorData = {}
      try {
        editorData = JSON.parse(await fs.readFile(editorSettingsPath, 'utf8'))
      } catch {
        // Editor settings don't exist, use empty object
      }

      // Read render settings
      const renderSettingsPath = path.join(projectPath, 'render-settings.json')
      let renderData = {}
      try {
        renderData = JSON.parse(await fs.readFile(renderSettingsPath, 'utf8'))
      } catch {
        // Render settings don't exist, use empty object
      }

      // Read other plugin settings
      const pluginData = {}
      try {
        const files = await fs.readdir(projectPath)
        for (const file of files) {
          if (file.endsWith('-settings.json') && file !== 'editor-settings.json' && file !== 'render-settings.json') {
            const pluginName = file.replace('-settings.json', '')
            try {
              const pluginFilePath = path.join(projectPath, file)
              pluginData[pluginName] = JSON.parse(await fs.readFile(pluginFilePath, 'utf8'))
            } catch (error) {
              console.warn(`Failed to read plugin settings for ${pluginName}:`, error)
            }
          }
        }
      } catch (error) {
        console.warn('Failed to read plugin settings:', error)
      }

      // TODO: Read assets manifest
      const assets = {}

      reply.send({
        project: projectInfo,
        scene: sceneData,
        editor: editorData,
        render: renderData,
        assets: assets,
        projectPath: projectName,
        ...pluginData // Include any other plugin data
      })

    } catch (error) {
      console.error('Error loading project:', error)
      reply.code(404).send({ error: 'Project not found' })
    }
  })

  // Save project data
  fastify.post('/api/projects/:projectName/save', async (request, reply) => {
    try {
      const { projectName } = request.params
      // Handle both old format {scene, editor, assets} and new format {editor, render, scene}
      const { scene, editor, assets, render, ...otherPlugins } = request.body
      const projectPath = path.join(PROJECTS_DIR, projectName)

      // Update project metadata
      const projectInfoPath = path.join(projectPath, 'project.json')
      let projectInfo = {}
      try {
        projectInfo = JSON.parse(await fs.readFile(projectInfoPath, 'utf8'))
      } catch {
        // Create default if doesn't exist
        projectInfo = {
          name: projectName,
          version: '1.0.0',
          engineVersion: '0.1.0',
          created: new Date().toISOString()
        }
      }
      
      projectInfo.lastModified = new Date().toISOString()
      await fs.writeFile(projectInfoPath, JSON.stringify(projectInfo, null, 2))

      // Save scene data
      if (scene) {
        const mainScenePath = path.join(projectPath, 'scenes', 'main.json')
        await fs.writeFile(mainScenePath, JSON.stringify(scene, null, 2))
      }

      // Save editor settings (optional)
      if (editor) {
        const editorSettingsPath = path.join(projectPath, 'editor-settings.json')
        await fs.writeFile(editorSettingsPath, JSON.stringify(editor, null, 2))
      }

      // Save render settings (optional)
      if (render) {
        const renderSettingsPath = path.join(projectPath, 'render-settings.json')
        await fs.writeFile(renderSettingsPath, JSON.stringify(render, null, 2))
      }

      // Save other plugin data
      for (const [pluginName, pluginData] of Object.entries(otherPlugins)) {
        if (pluginData && typeof pluginData === 'object') {
          const pluginSettingsPath = path.join(projectPath, `${pluginName}-settings.json`)
          await fs.writeFile(pluginSettingsPath, JSON.stringify(pluginData, null, 2))
        }
      }

      // TODO: Handle assets
      if (assets) {
        // Save assets to files
      }

      reply.send({ success: true })

    } catch (error) {
      console.error('Error saving project:', error)
      reply.code(500).send({ error: 'Failed to save project' })
    }
  })

  // Export project as .ren file
  fastify.get('/api/projects/:projectName/export', async (request, reply) => {
    try {
      const { projectName } = request.params
      const projectPath = path.join(PROJECTS_DIR, projectName)

      // Read all project data
      const projectInfo = JSON.parse(
        await fs.readFile(path.join(projectPath, 'project.json'), 'utf8')
      )

      let sceneData = {}
      try {
        sceneData = JSON.parse(
          await fs.readFile(path.join(projectPath, 'scenes', 'main.json'), 'utf8')
        )
      } catch {
        // Empty scene if file doesn't exist
      }

      // TODO: Collect all assets and encode as base64
      const assets = await collectProjectAssets(projectPath)

      // Create .ren file content
      const renData = {
        project: {
          ...projectInfo,
          lastModified: new Date().toISOString()
        },
        scene: sceneData,
        assets: assets
      }

      // Set headers for download
      reply.type('application/json')
      reply.header('Content-Disposition', `attachment; filename="${projectName}.ren"`)
      reply.send(JSON.stringify(renData, null, 2))

    } catch (error) {
      console.error('Error exporting project:', error)
      reply.code(500).send({ error: 'Failed to export project' })
    }
  })

  // Import/extract .ren file
  fastify.post('/api/projects/import', async (request, reply) => {
    try {
      const { projectName, renData } = request.body

      if (!projectName || !renData) {
        return reply.code(400).send({ error: 'Project name and .ren data required' })
      }

      const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const projectPath = path.join(PROJECTS_DIR, safeName)

      // Check if project already exists
      try {
        await fs.access(projectPath)
        return reply.code(409).send({ error: 'Project already exists' })
      } catch {
        // Project doesn't exist, continue
      }

      // Create project directory structure
      await fs.mkdir(projectPath, { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'textures'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'models'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'audio'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'assets', 'scripts'), { recursive: true })
      await fs.mkdir(path.join(projectPath, 'scenes'), { recursive: true })

      // Extract project data
      if (renData.project) {
        await fs.writeFile(
          path.join(projectPath, 'project.json'),
          JSON.stringify(renData.project, null, 2)
        )
      }

      if (renData.scene) {
        await fs.writeFile(
          path.join(projectPath, 'scenes', 'main.json'),
          JSON.stringify(renData.scene, null, 2)
        )
      }

      // Extract assets
      if (renData.assets) {
        await extractProjectAssets(projectPath, renData.assets)
      }

      reply.send({
        success: true,
        projectPath: safeName,
        projectName: projectName
      })

    } catch (error) {
      console.error('Error importing project:', error)
      reply.code(500).send({ error: 'Failed to import project' })
    }
  })

  // List all projects
  fastify.get('/api/projects', async (_, reply) => {
    try {
      const projects = []
      const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const projectInfoPath = path.join(PROJECTS_DIR, entry.name, 'project.json')
            const projectInfo = JSON.parse(await fs.readFile(projectInfoPath, 'utf8'))
            projects.push({
              name: entry.name,
              displayName: projectInfo.name,
              lastModified: projectInfo.lastModified,
              created: projectInfo.created
            })
          } catch {
            // Skip invalid projects
          }
        }
      }

      reply.send({ projects })

    } catch (error) {
      console.error('Error listing projects:', error)
      reply.code(500).send({ error: 'Failed to list projects' })
    }
  })
}

// Helper function to collect assets from project directory
async function collectProjectAssets(projectPath) {
  const assets = {}
  const assetsPath = path.join(projectPath, 'assets')
  
  try {
    const collectFromDir = async (dirPath, relativePath = '') => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const relativeFilePath = path.join(relativePath, entry.name).replace(/\\/g, '/')
        
        if (entry.isDirectory()) {
          await collectFromDir(fullPath, relativeFilePath)
        } else {
          // Read file and encode based on type
          const fileData = await fs.readFile(fullPath)
          const ext = path.extname(entry.name).toLowerCase()
          
          if (['.js', '.json', '.txt', '.md'].includes(ext)) {
            // Text files
            assets[relativeFilePath] = fileData.toString('utf8')
          } else {
            // Binary files - encode as base64
            const mimeType = getMimeType(ext)
            assets[relativeFilePath] = `data:${mimeType};base64,${fileData.toString('base64')}`
          }
        }
      }
    }
    
    await collectFromDir(assetsPath)
  } catch (error) {
    console.warn('Error collecting assets:', error)
  }
  
  return assets
}

// Helper function to extract assets to project directory
async function extractProjectAssets(projectPath, assets) {
  const assetsPath = path.join(projectPath, 'assets')
  
  for (const [relativePath, content] of Object.entries(assets)) {
    const fullPath = path.join(assetsPath, relativePath)
    const dirPath = path.dirname(fullPath)
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true })
    
    if (typeof content === 'string' && content.startsWith('data:')) {
      // Base64 encoded binary file
      const base64Data = content.split(',')[1]
      const binaryData = Buffer.from(base64Data, 'base64')
      await fs.writeFile(fullPath, binaryData)
    } else {
      // Text file
      await fs.writeFile(fullPath, content, 'utf8')
    }
  }
}

// Helper function to get MIME type from extension
function getMimeType(ext) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.obj': 'application/octet-stream',
    '.fbx': 'application/octet-stream'
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
}