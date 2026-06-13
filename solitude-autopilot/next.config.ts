import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'composio-core', 'node-cron'],
  webpack(config) {
    config.externals = [...(config.externals ?? []), 'better-sqlite3']
    return config
  },
}

export default nextConfig
