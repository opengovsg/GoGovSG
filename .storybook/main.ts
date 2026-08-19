import path from 'path'
import { createRequire } from 'module'
import type { StorybookConfig } from '@storybook/react-webpack5'
import webpack from 'webpack'

const require = createRequire(import.meta.url)

const dirname = path.dirname(new URL(import.meta.url).pathname)
const srcDirectory = path.join(dirname, '../src/client/app')

const config: StorybookConfig = {
  stories: ['../src/client/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  addons: ['@storybook/addon-mcp'],
  typescript: {
    // react-docgen-typescript spins up the TS compiler API, which this repo's
    // TS 7 (tsgo, a native Go binary) does not expose -- react-docgen is a
    // babel-based static analyzer and has no such dependency.
    reactDocgen: 'react-docgen',
  },
  webpackFinal: async (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      // App code imports its own TS modules with a .js extension (Node16
      // module resolution style, e.g. src/shared/util/asset-variant.js),
      // which only resolves because production webpack declares this alias.
      // Storybook's default webpack5 preset does not.
      extensionAlias: {
        ...config.resolve?.extensionAlias,
        '.js': ['.js', '.ts', '.tsx'],
      },
      alias: {
        ...config.resolve?.alias,
        // Mirrors webpack.config.ts: stories only ever render the gov variant.
        '@assets': path.resolve(srcDirectory, 'assets/gov'),
        // Screens dispatch real thunks on mount (e.g. getUrlsForUser) that
        // call cross-fetch under the hood. Its exported fetch is bound to
        // its own XHR implementation at module-load time, not window.fetch,
        // so stubbing window.fetch would not intercept it -- aliasing the
        // module itself is the only reliable interception point.
        'cross-fetch': path.resolve(
          dirname,
          '../src/client/storybook/mocks/cross-fetch.ts',
        ),
      },
      fallback: {
        ...config.resolve?.fallback,
        path: require.resolve('path-browserify'),
        url: require.resolve('url/'),
        querystring: require.resolve('querystring-es3'),
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
      },
    },
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules ?? []).filter(
          (rule) =>
            // Drop Storybook's default TS handling in favour of the same
            // swc-loader rule the production webpack config uses, so stories
            // are transpiled identically to the real app.
            !(
              rule &&
              typeof rule === 'object' &&
              'test' in rule &&
              rule.test instanceof RegExp &&
              rule.test.test('foo.tsx')
            ),
        ),
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'classic',
                  },
                },
              },
            },
          },
        },
      ],
    },
    plugins: [
      ...(config.plugins ?? []),
      new webpack.DefinePlugin({
        'process.env.ASSET_VARIANT': JSON.stringify('gov'),
      }),
    ],
  }),
}

export default config
