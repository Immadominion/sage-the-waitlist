import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Serve static HTML routes (e.g. /pitch, /whitepaper) from the public folder
 * during `vite dev` and `vite preview`. Without this, Vite's SPA-style HMR
 * shell intercepts the request and returns the React app instead of the
 * standalone HTML page that lives at public/<route>/index.html.
 */
function staticHtmlRoutes(routes: string[]): PluginOption {
  const handler = (req: any, res: any, next: any) => {
    if (!req.url) return next()
    const url = req.url.split('?')[0].replace(/\/$/, '')
    for (const route of routes) {
      if (url === `/${route}`) {
        const file = path.resolve(__dirname, 'public', route, 'index.html')
        if (fs.existsSync(file)) {
          res.setHeader('Content-Type', 'text/html')
          res.end(fs.readFileSync(file))
          return
        }
      }
    }
    next()
  }
  return {
    name: 'static-html-routes',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), staticHtmlRoutes(['pitch', 'whitepaper'])],
})
