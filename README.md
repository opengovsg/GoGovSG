# GoGovSG

[![Build Status](https://travis-ci.com/opengovsg/GoGovSG.svg?branch=develop)](https://travis-ci.com/opengovsg/GoGovSG) [![Coverage Status](https://coveralls.io/repos/github/opengovsg/GoGovSG/badge.svg?branch=develop)](https://coveralls.io/github/opengovsg/GoGovSG?branch=develop)

The official Singapore government link shortener.

## Content

- [GoGovSG](#gogovsg)
  - [Content](#content)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Running Locally](#running-locally)
    - [Setting up the infrastructure](#setting-up-the-infrastructure)
    - [Deploying](#deploying)
  - [Pre-release](#pre-release)
  - [Documentation](#documentation)
    - [Folder Structure](#folder-structure)
    - [Babel](#babel)
    - [ESLint](#eslint)
    - [Webpack](#webpack)
    - [Webpack dev server](#webpack-dev-server)
    - [Nodemon](#nodemon)
    - [Express](#express)
    - [Concurrently](#concurrently)
    - [VSCode + ESLint](#vscode--eslint)

## Introduction

Go.gov.sg is the official Singapore government link shortener, built by the [Open Government Products](https://open.gov.sg) team in [GovTech](https://tech.gov.sg).

There are multiple reasons why we built an official government link shortener:

- URLs are **too long** to fit into tweets or SMSes, and **difficult to remember**
- Email clients might block other commercial link shorteners if they are listed as **spam** on their site
- Citizens are afraid of **phishing** when receiving a shortened link and unsure of where it goes

With Go.gov.sg, citizens are safe in the knowledge that the links are **official** and **safe**. Any public officer can log in with their government emails and immediately create short links with the official `gov.sg` domain.

## Getting Started

Start by cloning the repository and installing dependencies.

```bash
# Clone the repository
git clone git@github.com:opengovsg/GoGovSG.git gogovsg

# Go inside the directory
cd gogovsg

# Install dependencies
npm install
```

### Running Locally

Make sure you have docker-compose version >= `1.23.1` and Docker version >= `18.09.0` installed. Then run:

```bash
npm run dev
```

Docker-compose will spin up a postgresql database and redis container to be connected to the backend server.
Once the setup is complete, the local version of GoGovSG can be accessed on your browser via `localhost:3000`.
Note that 3000 is the port number that the webpack dev server listens on; the backend server actually listens
on port 8080 instead.

Because redirects are served directly from the backend, shortlinks should be accessed
via `localhost:8080/shortlink` and not `localhost:3000/shortlink`. Also, given that GoGovSG will attempt to send
emails directly from your computer when running on localhost, there is a chance that the email might land in
spam or not be sent entirely. To mitigate this, we have set the one-time password for all log-in attempts
on localhost to be `111111`.

### Setting up the infrastructure

Much of this step will involve setting up key infrastructure components since we do not have docker-compose
to do that for us. On top of running the server, GoGovSG minimally requires the following infrastructure to be available:
- A PostgreSQL database (for storing short-long URL mappings)
- A Redis server (transient storage of sessions, one-time passwords, click statistics and frequently used shortlinks)

After these have been set up, set the environment variables according to the table below:

|Environment Variable|Required|Description/Value|
|:---:|:---:|:---|
|NODE_ENV|Yes|`production`|
|DB_URI|Yes|The postgres connection string, e.g. `postgres://postgres:postgres@postgres:5432/postgres`|
|OG_URL|Yes|The origin url, used for both google analytics and circular-redirect prevention. E.g. `https://go.gov.sg`|
|AWS_S3_BUCKET|Yes|The bucket name used for storing file uploads.|
|AWS_ACCESS_KEY_ID|Yes|The access key id used for programatic access to S3 bucket.|
|AWS_SECRET_ACCESS_KEY|Yes|The secret key used for programatic access to S3 bucket.|
|REDIS_OTP_URI|Yes|Redis connection string, e.g. `redis://redis:6379/0`|
|REDIS_SESSION_URI|Yes|Redis connection string, e.g. `redis://redis:6379/1`|
|REDIS_REDIRECT_URI|Yes|Redis connection string, e.g. `redis://redis:6379/2`|
|REDIS_STAT_URI|Yes|Redis connection string, e.g. `redis://redis:6379/3`|
|SESSION_SECRET|Yes|For hashing browser sessions, e.g. `change-this`|
|VALID_EMAIL_GLOB_EXPRESSION|Yes|The glob expression used to test if a provided email address is valid. For safety, we have disabled the use of negations, ext-glob, glob stars (`**`) and braces, e.g. `*@youremaildomain.com`|
|GA_TRACKING_ID|No|The Google Analytics tracking ID, e.g. `UA-12345678-9`|
|SENTRY_AUTH_TOKEN|No|To get relevant permissions to upload the source maps.|
|SENTRY_DNS|No|The Sentry DNS used for bug and error tracking. e.g. `https://12345@sentry.io/12345`|
|SENTRY_ORG|No|Our Sentry organisation name, e.g. `example-org`|
|SENTRY_PROJECT|No|The relevant Sentry project. e.g. `project-prod`|
|SENTRY_URL|No|The Sentry url. e.g. `https://sentry.io/`|
|LOGIN_MESSAGE|No|A text message that will be displayed on the login page as a snackbar.|

Trigger the typescript compilation and webpack bundling process by calling `npm run build`.

Finally, start the production server by running `npm start`.

### Deploying

GoGovSG uses Travis to deploy to AWS Elastic Beanstalk. We also use Sentry.io to track client-side errors.

|Environment Variable|Required|Description/Value|
|:---:|:---:|:---|
|AWS_ACCESS_KEY_ID|Yes|AWS credential ID used to deploy to Elastic and Modify files on S3|
|AWS_SECRET_ACCESS_KEY|Yes|AWS credential secret used to deploy to Elastic Beanstalk and Modify files on S3|
|AWS_EB_ENV_PRODUCTION, AWS_EB_ENV_STAGING|Yes|Elastic Beanstalk environment name|
|AWS_EB_APP_PRODUCTION, AWS_EB_APP_STAGING|Yes|Elastic Beanstalk application name|
|AWS_EB_BUCKET_PRODUCTION, AWS_EB_BUCKET_STAGING|Yes|S3 bucket used to store the application bundle|
|AWS_EB_REGION|Yes|AWS region to deploy to, e.g. `ap-southeast-1`|
|EMAIL_RECIPIENT|Yes|Email for Travis notifications|
|PRODUCTION_BRANCH, STAGING_BRANCH|Yes|Name of Git branches for triggerring deployments to production/staging respectively|
|REPO|Yes|Docker container registry URI to push built images to|
|ROTATED_LINKS|No|List of comma separated path of links to rotate on the landing page|
|SENTRY_ORG|No|Sentry.io organisation name|
|SENTRY_PROJECT|No|Sentry.io project name|
|SENTRY_URL|No|Sentry.io URL e.g. `https://sentry.io/`|
|SENTRY_DNS|No|Sentry.io endpoint to post client-side errors to|

## Pre-release

We have yet to setup travis to automate these steps:

- Update package version
- Update credits [opengovsg/credits-generator](https://github.com/opengovsg/credits-generator)
- Upload pdf to S3 bucket

## Documentation

### Folder Structure

All source code resides in the `src` directory. Inside `src`, there is `client` and `server` directory. Frontend code (react, css, js and other assets) will be in `client` directory. Backend Node.js/Express code will be in the `server` directory.

### Babel

[Babel](https://babeljs.io/) helps us to write code in the latest version of JavaScript. If an environment does not support certain features natively, Babel will help us to compile those features down to a supported version. It also helps us to convert JSX to Javascript.
[.babelrc file](https://babeljs.io/docs/usage/babelrc/) is used describe the configurations required for Babel. Below is the .babelrc file which I am using.

```javascript
{
    "presets": ["env", "react"]
}
```

Babel requires plugins to do the transformation. Presets are the set of plugins defined by Babel. Preset **env** allows to use babel-preset-es2015, babel-preset-es2016, and babel-preset-es2017 and it will transform them to ES5. Preset **react** allows us to use JSX syntax and it will transform JSX to Javascript.

### ESLint

[ESLint](https://eslint.org/) is a pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.

[.eslintrc.json file](<(https://eslint.org/docs/user-guide/configuring)>) (alternatively configurations can we written in Javascript or YAML as well) is used describe the configurations required for ESLint.

[I am using Airbnb's Javascript Style Guide](https://github.com/airbnb/javascript) which is used by many JavaScript developers worldwide. Since we are going to write both client (browser) and server side (Node.js) code, I am setting the **env** to browser and node. Optionally, we can override the Airbnb's configurations to suit our needs. I have turned off [**no-console**](https://eslint.org/docs/rules/no-console), [**comma-dangle**](https://eslint.org/docs/rules/comma-dangle) and [**react/jsx-filename-extension**](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md) rules.

### Webpack

[Webpack](https://webpack.js.org/) is a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser.

[webpack.config.js](https://webpack.js.org/configuration/) file is used to describe the configurations required for webpack.

1. **entry:** entry: ./src/client/index.js is where the application starts executing and webpack starts bundling.
    Note: babel-polyfill is added to support async/await. Read more [here](https://babeljs.io/docs/en/babel-polyfill#usage-in-node-browserify-webpack).
2. **output path and filename:** the target directory and the filename for the bundled output
3. **module loaders:** Module loaders are transformations that are applied on the source code of a module. We pass all the js file through [babel-loader](https://github.com/babel/babel-loader) to transform JSX to Javascript. CSS files are passed through [css-loaders](https://github.com/webpack-contrib/css-loader) and [style-loaders](https://github.com/webpack-contrib/style-loader) to load and bundle CSS files. Fonts and images are loaded through url-loader.
4. **Dev Server:** Configurations for the webpack-dev-server which will be described in coming section.
5. **plugins:** [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin) is a webpack plugin to remove the build folder(s) before building. [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) simplifies creation of HTML files to serve your webpack bundles. It loads the template (public/index.html) and injects the output bundle.

### Webpack dev server

[Webpack dev server](https://webpack.js.org/configuration/dev-server/) is used along with webpack. It provides a development server that provides live reloading for the client side code. This should be used for development only.

The devServer section of webpack.config.js contains the configuration required to run webpack-dev-server which is given below.

```javascript
devServer: {
    port: 3000,
    open: true,
    proxy: {
        "/api": "http://localhost:8080"
    }
}
```

[**Port**](https://webpack.js.org/configuration/dev-server/#devserver-port) specifies the Webpack dev server to listen on this particular port (3000 in this case). When [**open**](https://webpack.js.org/configuration/dev-server/#devserver-open) is set to true, it will automatically open the home page on startup. [Proxying](https://webpack.js.org/configuration/dev-server/#devserver-proxy) URLs can be useful when we have a separate API backend development server and we want to send API requests on the same domain. In our case, we have a Node.js/Express backend where we want to send the API requests to.

### Nodemon

Nodemon is a utility that will monitor for any changes in the server source code and it automatically restart the server. This is used in development only.

nodemon.json file is used to describe the configurations for Nodemon.

```javascript
{
  "watch": ["src/server/"]
}
```

Here, we tell nodemon to watch the files in the directory src/server where out server side code resides. Nodemon will restart the node server whenever a file under src/server directory is modified.

### Express

Express is a web application framework for Node.js. It is used to build our backend API's.

src/server/index.js is the entry point to the server application. This starts a server and listens on port 8080 for connections. It is also configured to serve the static files from **dist** directory.

### Concurrently

[Concurrently](https://github.com/kimmobrunfeldt/concurrently) is used to run multiple commands concurrently. I am using it to run the webpack dev server and the backend node server concurrently in the development environment. Below are the npm/yarn script commands used.

```javascript
"client": "webpack-dev-server --mode development --devtool inline-source-map --hot",
"server": "nodemon src/server/index.js",
"dev": "concurrently \"npm run server\" \"npm run client\""
```

### VSCode + ESLint

[VSCode](https://code.visualstudio.com/) is a lightweight but powerful source code editor. [ESLint](https://eslint.org/) takes care of the code-quality.
