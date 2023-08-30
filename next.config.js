/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    async redirects() {
        return [
          {
            source: '/',
            destination: '/list_orders',
            permanent: false,
          },
        ]
    },
}

module.exports = nextConfig
