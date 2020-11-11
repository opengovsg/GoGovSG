const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const SentryCliPlugin = require('@sentry/webpack-plugin')

const outputDirectory = 'dist'
const srcDirectory = path.join(__dirname, 'src/client')

const requiredSentryEnvVar = [
  process.env.SENTRY_AUTH_TOKEN,
  process.env.SENTRY_DNS,
  process.env.SENTRY_ORG,
  process.env.SENTRY_PROJECT,
  process.env.SENTRY_URL,
]

module.exports = () => {
  const jsBundle = {
    entry: ['babel-polyfill', path.join(srcDirectory, 'index.tsx')],
    output: {
      path: path.join(__dirname, outputDirectory),
      filename: 'bundle.js',
      publicPath: '/',
    },
    resolve: {
      extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
      alias: {
        '~': srcDirectory,
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
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
        '!/(assets/**|bundle.js|favicon*)': 'http://localhost:8080',
      },
      historyApiFallback: true,
      disableHostCheck: true,
    },
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './src/client/app/assets/favicon/favicon.ico',
        chunksSortMode: 'none',
        meta: {
          // Open Graph protocol meta tags
          'og:title': 'Go.gov.sg',
          'og:type': 'article',
          'og:description': 'The official Singapore government link shortener',
          'og:image':
            'https://s3-ap-southeast-1.amazonaws.com/gosg-public/gosg-landing-meta.jpg',
        },
      }),
    ],
  }
  if (requiredSentryEnvVar.reduce((x, y) => x && y)) {
    console.log(
      '\x1b[32m[webpack-sentry-sourcemaps] Build will include upload of sourcemaps to Sentry.\x1b[0m',
    )
    jsBundle.plugins.push(
      new SentryCliPlugin({
        include: '.',
        ignoreFile: '.gitignore',
        ignore: ['node_modules', 'webpack.config.js'],
      }),
    )
  } else {
    console.log(
      '\x1b[33m[webpack-sentry-sourcemaps] Skipping upload of sourcemaps to Sentry because of missing env vars. Ignore this if it was intended.\x1b[0m',
    )
  }
  return [jsBundle]
}
