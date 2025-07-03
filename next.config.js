const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ["neo4j-driver"]
  }
}

module.exports = nextConfig

