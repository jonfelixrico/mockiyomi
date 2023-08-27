/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.node$/,

      use: [
        /*
         * Needed for .node packages to work. Solution is taken from
         * https://answers.netlify.com/t/canvas-node-webpack-isnt-working-with-node-loader/46600/3
         */
        {
          loader: 'node-loader',
        },
      ],
    })

    return config
  },

  // This is needed to make Next.js work with Docker
  output: 'standalone',
}

module.exports = nextConfig
