import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import SentryCliPlugin from '@sentry/webpack-plugin'
import webpack from 'webpack'

import assetVariant from './src/shared/util/asset-variant'
import ddEnv from './src/shared/util/environment-variables'

const outputDirectory = 'dist'
const srcDirectory = path.join(__dirname, 'src/client/app')

const requiredSentryEnvVar = [
  process.env.SENTRY_AUTH_TOKEN,
  process.env.SENTRY_DNS,
  process.env.SENTRY_ORG,
  process.env.SENTRY_PROJECT,
  process.env.SENTRY_URL,
]

const assetResolveDir = `assets/${assetVariant}`

const govMetaTags = {
  'og:title': 'Go.gov.sg',
  'og:type': 'article',
  'og:description': 'The official Singapore government link shortener',
  'og:image':
    'https://s3-ap-southeast-1.amazonaws.com/gosg-public/gosg-landing-meta.jpg',
}

const eduMetaTags = {
  'og:title': 'For.edu.sg',
  'og:type': 'article',
  'og:description': 'Trusted short links from education institutions',
  'og:image':
    'https://s3-ap-southeast-1.amazonaws.com/gosg-public/edusg-landing-meta.png',
}

const healthMetaTags = {
  'og:title': 'For.sg',
  'og:type': 'article',
  'og:description': 'Trusted short links from healthcare institutions',
  'og:image':
    'https://s3-ap-southeast-1.amazonaws.com/gosg-public/forsg-landing-meta.png',
}

const metaVariantMap = {
  gov: govMetaTags,
  edu: eduMetaTags,
  health: healthMetaTags,
}
const metaVariant = metaVariantMap[assetVariant] || govMetaTags

module.exports = () => {
  const jsBundle = {
    target: ['web', 'es5'],
    entry: [
      // explicitly specify transpilation order to prevent IE 11 from breaking
      'babel-polyfill',
      'react',
      'react-dom',
      path.join(srcDirectory, 'index.tsx'),
    ],
    output: {
      path: path.join(__dirname, outputDirectory),
      filename: 'bundle.js',
      publicPath: '/',
      assetModuleFilename: 'assets/[name][ext]',
    },
    resolve: {
      extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', '.png', '.svg'],
      alias: {
        '~': srcDirectory,
        // this aliases all "@assets" imports to read from the correct assetVariant asset directory
        '@assets': path.resolve(srcDirectory, assetResolveDir),
      },
      fallback: {
        path: require.resolve('path-browserify'),
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
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
          type: 'asset/resource',
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
        template: path.join('./public', `index-${assetVariant}.html`),
        favicon: `./src/client/app/${assetResolveDir}/favicon/favicon.ico`,
        // @ts-ignore - type definition is incorrect, chunksSortMode 'none' only performs identity mapping (no-sort).
        chunksSortMode: 'none',
        meta: metaVariant,
      }),
      new webpack.DefinePlugin({
        'process.env.ASSET_VARIANT': JSON.stringify(assetVariant),
        DD_SERVICE: JSON.stringify(assetVariant),
        DD_ENV: JSON.stringify(ddEnv),
      }),
    ],
  }
  console.log(`DD_SERVICE is: ${DD_SERVICE}`)
  console.log(`DD_ENV is: ${DD_ENV}`)
  if (requiredSentryEnvVar.reduce((x, y) => x && y)) {
    console.log(
      '\x1b[32m[webpack-sentry-sourcemaps] Build will include upload of sourcemaps to Sentry.\x1b[0m',
    )
    jsBundle.plugins.push(
      // @ts-ignore - this should add a new plugin regardless of the current plugins in the plugins array
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
