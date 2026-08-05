import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import webpack from 'webpack'

import assetVariant from './src/shared/util/asset-variant'
import { ddEnv, ddService } from './src/shared/util/environment-variables'

const outputDirectory = 'dist'
const srcDirectory = path.join(__dirname, 'src/client/app')

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
        querystring: require.resolve('querystring-es3'),
        url: require.resolve('url/'),
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
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:8080',
        },
        {
          context: (pathname: string) =>
            !pathname.startsWith('/assets/') &&
            pathname !== '/bundle.js' &&
            !pathname.startsWith('/favicon'),
          target: 'http://localhost:8080',
        },
      ],
      historyApiFallback: true,
      allowedHosts: 'all',
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
        'process.env.DD_SERVICE': JSON.stringify(ddService),
        'process.env.DD_ENV': JSON.stringify(ddEnv),
      }),
    ],
  }
  return [jsBundle]
}
