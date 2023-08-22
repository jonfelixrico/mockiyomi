/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.node$/,

      use: [
        {
          loader: 'node-loader',
        },
      ],
    })

    return config
  },
}

module.exports = nextConfig
