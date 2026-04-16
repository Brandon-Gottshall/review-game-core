import path from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(siteRoot, '..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: packageRoot,
  },
  transpilePackages: ['@brandon-gottshall/review-game-core'],
  allowedDevOrigins: ['127.0.0.1'],
}

export default nextConfig
