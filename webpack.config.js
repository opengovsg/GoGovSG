const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const outputDirectory = 'dist'
const srcDirectory = path.join(__dirname, 'src/client')

module.exports = () => {
  const jsBundle = {
    entry: ['babel-polyfill', path.join(srcDirectory, 'index.js')],
    output: {
      path: path.join(__dirname, outputDirectory),
      filename: 'bundle.js',
      publicPath: '/',
    },
    resolve: {
      extensions: ['.jsx', '.js', '.json'],
      alias: {
        '~': srcDirectory,
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'assets',
                name: '[name].[ext]',
              },
            },
          ],
        },
      ],
    },
    devServer: {
      port: 3000,
      proxy: {
        '/api': 'http://localhost:8080',
      },
      historyApiFallback: true,
    },
    plugins: [
      new CleanWebpackPlugin([outputDirectory]),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './src/client/assets/favicon/favicon.ico',
        chunksSortMode: 'none',
        meta: {
          // Open Graph protocol meta tags
          'og:title': 'Go.gov.sg',
          'og:type': 'article',
          'og:description': 'The official Singapore government link shortener',
          'og:image': 'https://s3-ap-southeast-1.amazonaws.com/gosg-public/gosg-landing-meta.jpg',
        },
      }),
    ],
  }
  return [jsBundle]
}
