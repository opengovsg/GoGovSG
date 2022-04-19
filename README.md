# GoGovSG

[![Build Status](https://travis-ci.com/opengovsg/GoGovSG.svg?branch=develop)](https://travis-ci.com/opengovsg/GoGovSG)
[![Coverage Status](https://coveralls.io/repos/github/opengovsg/GoGovSG/badge.svg?branch=develop)](https://coveralls.io/github/opengovsg/GoGovSG?branch=develop)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/opengovsg/GoGovSG)

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
  - [Operations](#operations)
    - [Transferring links to a new owner or email address](#transferring-links-to-a-new-owner-or-email-address)
  - [Developer Documentation](#developer-documentation)
    - [Folder Structure](#folder-structure)
    - [Babel](#babel)
    - [ESLint](#eslint)
    - [Webpack](#webpack)
    - [Webpack dev server](#webpack-dev-server)
    - [ts-node-dev](#ts-node-dev)
    - [Express](#express)
    - [Concurrently](#concurrently)
    - [VSCode + ESLint](#vscode--eslint)
    - [Redux Devtools](#redux-devtools)

## Introduction

Go.gov.sg is the official Singapore government link shortener, built by the [Open Government Products](https://open.gov.sg) team in [GovTech](https://tech.gov.sg). This repository serves as the codebase to serve two link shortener environments, [for.edu.sg](https://www.for.edu.sg), and [Go.gov.sg](https://www.go.gov.sg).

There are multiple reasons why we built an official government link shortener:

- URLs are **too long** to fit into tweets or SMSes, and **difficult to remember**
- Email clients might block other commercial link shorteners if they are listed as **spam** on their site
- Citizens are afraid of **phishing** when receiving a shortened link and unsure of where it goes

With Go.gov.sg, citizens are safe in the knowledge that the links are **official** and **safe**. Any authorized user can log in with their government emails and immediately create authenticated and recognisable short links.

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

Because redirects are served directly from the backend, shortlinks can be accessed via `localhost:3000/shortlink`, 
but that is really being proxied to `localhost:8080/shortlink`. Also, given that GoGovSG will attempt to send
emails directly from your computer when running on localhost, there is a chance that the email might land in
spam or not be sent entirely. To mitigate this, we have set the one-time password for all log-in attempts
on localhost to be `111111`.

### Setting up the infrastructure

Much of this step will involve setting up key infrastructure components since we do not have docker-compose
to do that for us. On top of running the server, GoGovSG minimally requires the following infrastructure to be available:
- A PostgreSQL database (for storing short-long URL mappings)
- A Redis server (transient storage of sessions, one-time passwords, click statistics and frequently used shortlinks)

Other infrastructure used in GoGovSG:
- Serverless functions (for migrating user links)
- Batch jobs (for backups of our database to external source)

After these have been set up, set the environment variables according to the table below:

#### Server
|Environment Variable|Required|Description/Value|Shared across environments|
|:---:|:---:|:---:|:---|
|NODE_ENV|Yes|`production`|Yes|
|DB_URI|Yes|The postgres connection string, e.g. `postgres://postgres:postgres@postgres:5432/postgres`|No|
|OG_URL|Yes|The origin url, used for both google analytics and circular-redirect prevention. E.g. `https://go.gov.sg`|No|
|AWS_S3_BUCKET|Yes|The bucket name used for storing file uploads.|No|
|REDIS_OTP_URI|Yes|Redis connection string, e.g. `redis://redis:6379/0`|No|
|REDIS_SESSION_URI|Yes|Redis connection string, e.g. `redis://redis:6379/1`|No|
|REDIS_REDIRECT_URI|Yes|Redis connection string, e.g. `redis://redis:6379/2`|No|
|REDIS_STAT_URI|Yes|Redis connection string, e.g. `redis://redis:6379/3`|No|
|REDIS_SAFE_BROWSING_URI|Yes|Redis connection string, e.g. `redis://redis:6379/4`|No|
|SESSION_SECRET|Yes|For hashing browser sessions, e.g. `change-this`|No|
|VALID_EMAIL_GLOB_EXPRESSION|Yes|The glob expression used to test if a provided email address is valid. For safety, we have disabled the use of negations, ext-glob, glob stars (`**`) and braces, e.g. `*@youremaildomain.com`|No|
|GA_TRACKING_ID|No|The Google Analytics tracking ID, e.g. `UA-12345678-9`|No|
|SENTRY_AUTH_TOKEN|No|To get relevant permissions to upload the source maps.|Yes|
|SENTRY_DNS|No|The Sentry DNS used for bug and error tracking. e.g. `https://12345@sentry.io/12345`|Yes|
|SENTRY_ORG|No|Our Sentry organisation name, e.g. `example-org`|Yes|
|SENTRY_PROJECT|No|The relevant Sentry project. e.g. `project-prod`|Yes|
|SENTRY_URL|No|The Sentry url. e.g. `https://sentry.io/`|Yes|
|LOGIN_MESSAGE|No|A text message that will be displayed on the login page as a snackbar|Not necessarily|
|USER_MESSAGE|No|A text message that will be displayed as a banner, once the user has logged in|Not necessarily|
|ANNOUNCEMENT_MESSAGE|No|The message in the announcement displayed as a modal to users on login|Not necessarily|
|ANNOUNCEMENT_TITLE|No|The title in the announcement displayed as a modal to users on login|Not necessarily|
|ANNOUNCEMENT_SUBTITLE|No|The subtitle in the announcement displayed as a modal to users on login|Not necessarily|
|ROTATED_LINKS|No|List of comma separated path of links to rotate on the landing page|Not necessarily|
|ANNOUNCEMENT_URL|No|The hyperlink for the button in the announcement displayed as a modal to users on login|Not necessarily|
|ANNOUNCEMENT_IMAGE|No|The image in the announcement displayed as a modal to users on login|Not necessarily|
|CSP_REPORT_URI|No|A URI to report CSP violations to.|Yes|
|CSP_ONLY_REPORT_VIOLATIONS|No|Only report CSP violations, do not enforce.|Not necessarily|
|CLOUDMERSIVE_KEY|No|API key for access to Cloudmersive.|Yes|
|SAFE_BROWSING_KEY|No|API key for access to Google Safe Browsing.|Yes|
|ASSET_VARIANT|Yes|Asset variant specifying environment for deployment, one of `edu`, `gov`|No|
|COOKIE_MAX_AGE|Yes|Session duration of cookie|Yes|
|REPLICA_URI|Yes|The postgres connection string, e.g. `postgres://postgres:postgres@postgres:5432/postgres`|No|

#### Serverless functions for link migration
|Secrets|Required|Description/Value|Shared across environments|
|:---:|:---:|:---:|:---|
|DATABASE_URL|Yes|The postgres connection string, e.g. `postgres://postgres:postgres@postgres:5432/postgres`|No|

#### Batch functions for backups
|Secrets|Required|Description/Value|Shared across environments|
|:---:|:---:|:---:|:---|
|DB_URI|Yes|The postgres connection string, e.g. `postgres://postgres:postgres@postgres:5432/postgres`|No|
|GCS_CREDENTIALS|Yes|Authorization credentials for writing to backup buckets in GCS|Yes|

|Environment Variable|Required|Description/Value|Shared across environments|
|:---:|:---:|:---:|:---|
|GCS_BUCKET|Yes|Name of bucket in GCS to write to|No|
|CRONITOR_MONITOR_CODE|No|ID for Cronitor monitor to monitor batch jobs|No|

Trigger the typescript compilation and webpack bundling process by calling `npm run build`.

Finally, start the production server by running `npm start`.

### Deploying

GoGovSG uses Github Actions and Serverless to deploy to AWS Elastic Beanstalk and AWS Lambda. We also use Sentry.io to track client-side errors.

|Secrets|Required|Description/Value|
|:---:|:---:|:---|
|AWS_ACCESS_KEY_ID|Yes|AWS credential ID used to deploy to Elastic and Modify files on S3|
|AWS_SECRET_ACCESS_KEY|Yes|AWS credential secret used to deploy to Elastic Beanstalk and Modify files on S3|
|SENTRY_AUTH_TOKEN|No|To get relevant permissions to upload the source maps|
|GITHUB_TOKEN|Yes*|Used by Coveralls to verify test coverage on repo. Does not need to be manually specified as it is specified by Github Actions. [More Info](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)

|Environment Variable|Required|Description/Value|
|:---:|:---:|:---|
|EB_ENV_(EDU_)PRODUCTION, EB_ENV_(EDU_)STAGING|Yes|Elastic Beanstalk environment name|
|EB_APP_PRODUCTION, EB_APP_STAGING|Yes|Elastic Beanstalk application name|
|EB_BUCKET_PRODUCTION, EB_BUCKET_STAGING|Yes|S3 bucket used to store the application bundle|
|PRODUCTION_BRANCH, STAGING_BRANCH|Yes|Name of Git branches for triggerring deployments to production/staging respectively|
|ECR_URL|Yes|AWS ECR Docker container registry URI to push built images to|
|ECR_REPO|Yes|Name of repository in AWS ECR containing images|
|SENTRY_ORG|No|Sentry.io organisation name|
|SENTRY_PROJECT_PRODUCTION, SENTRY_PROJECT_STAGING|No|Sentry.io project name|
|SENTRY_URL|No|Sentry.io URL e.g. `https://sentry.io/`|
|SENTRY_DNS_PRODUCTION,SENTRY_DNS_STAGING|No|Sentry.io endpoint to post client-side errors to|

## Operations

### Transferring links to a new owner or email address

Functions to safely transfer links to new owners can be accessed on AWS Lambda console (for authorized users only).

To transfer a single link to a new email address (must be lowercase), please use the relevant Lambda function ([gogov-production](https://ap-southeast-1.console.aws.amazon.com/lambda/home?region=ap-southeast-1#/functions/gogovsg-production-migrate-url-to-user?tab=testing), [edu-production]()) to create an event with the following event body:

```json
{
  "shortUrl": "<short url to be transfered>",
  "toUserEmail": "<user email to transfer to>"
}
```

To transfer all links belonging to an account to another account, please use the relevant Lambda function ([gogov-production](https://ap-southeast-1.console.aws.amazon.com/lambda/home?region=ap-southeast-1#/functions/gogovsg-production-migrate-user-links?tab=testing), [edu-production]()) to create an event with the following event body:

```json
{
  "fromUserEmail": "<user email to transfer from>",
  "toUserEmail": "<user email to transfer to>"
}
```

## Developer Documentation

### Folder Structure

All source code resides in the `src` directory. Inside `src`, there is `client` and `server` directory. Frontend code (react, css, js and other assets) will be in `client` directory. Backend Node.js/Express code will be in the `server` directory.

### Asset variants

This repository serves as the codebase to serve two link shortener environments, [for.edu.sg](https://www.for.edu.sg), and [Go.gov.sg](https://www.go.gov.sg). These environments are run on separate infrastructure, and the deployment pipeline is set up to deploy any code changes in this codebase across all infrastructure environments. The environments are identical apart from the assets, copy and list of authorized users.

### Babel

[Babel](https://babeljs.io/) helps us to write code in the latest version of JavaScript. If an environment does not support certain features natively, Babel will help us to compile those features down to a supported version. It also helps us to convert JSX to Javascript.
[babel.config.json file](https://babeljs.io/docs/en/configuration#babelconfigjson) is used to describe the configurations required for Babel. 

Babel requires plugins to do the transformation. Presets are the set of plugins defined by Babel. Preset **env** allows to use babel-preset-es2015, babel-preset-es2016, and babel-preset-es2017 and it will transform them to ES5. Preset **react** allows us to use JSX syntax and it will transform JSX to Javascript.

### ESLint

[ESLint](https://eslint.org/) is a pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.

[.eslintrc.json file](<(https://eslint.org/docs/user-guide/configuring)>) (alternatively configurations can we written in Javascript or YAML as well) is used describe the configurations required for ESLint.

[I am using Airbnb's Javascript Style Guide](https://github.com/airbnb/javascript) which is used by many JavaScript developers worldwide. Since we are going to write both client (browser) and server side (Node.js) code, I am setting the **env** to browser and node. Optionally, we can override the Airbnb's configurations to suit our needs. I have turned off [**no-console**](https://eslint.org/docs/rules/no-console), [**comma-dangle**](https://eslint.org/docs/rules/comma-dangle) and [**react/jsx-filename-extension**](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md) rules.

### Webpack

[Webpack](https://webpack.js.org/) is a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser.

[webpack.config.js](https://webpack.js.org/configuration/) file is used to describe the configurations required for webpack.

1. **entry:** entry: ./src/client/app/index.tsx is where the application starts executing and webpack starts bundling.
    Note: babel-polyfill is added to support async/await. Read more [here](https://babeljs.io/docs/en/babel-polyfill#usage-in-node-browserify-webpack).
2. **output path and filename:** the target directory and the filename for the bundled output
3. **resolve:** We use aliasing at bundle time to inject and resolve the right asset variant path, which allows us to easily switch between asset folders for the different environments. 
4. **module loaders:** Module loaders are transformations that are applied on the source code of a module. We pass all the js file through [babel-loader](https://github.com/babel/babel-loader) to transform JSX to Javascript. Fonts and images are loaded through [file-loader](https://github.com/webpack-contrib/file-loader).
5. **Dev Server:** Configurations for the webpack-dev-server which will be described incoming section.
6. **plugins:** [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin) is a webpack plugin to remove the build folder(s) before building. [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) simplifies creation of HTML files to serve your webpack bundles. It loads the template (public/index.html) and injects the output bundle.

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

### ts-node-dev

[ts-node-dev](https://github.com/whitecolor/ts-node-dev) will monitor for any changes in the server source code and automatically restart the server. This is used in development only. It watches changes to all files required from the entry point onwards, and will restart the node server whenever such files are modified.

ts-node-dev also allows debugging via [Inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/#inspector-clients). The quickest way to debug the application will be to use Chrome DevTools via chrome://inspect. VSCode users may want to add the following to their launch.json to quickly attach VSCode to the application for debugging:

```json
    {
      "type": "node",
      "request": "attach",
      "name": "Inspect",
      "protocol": "inspector",
      "port": 9229,
      "restart": true,
      "cwd": "${workspaceFolder}"
    }
```

### Express

Express is a web application framework for Node.js. It is used to build our backend API's.

`src/server/index.ts` is the entry point to the server application. This starts a server and listens on port 8080 for connections. It is also configured to serve the static files from **dist** directory.

### Concurrently

[Concurrently](https://github.com/kimmobrunfeldt/concurrently) is used to run multiple commands concurrently. I am using it to run the webpack dev server and the backend node server concurrently in the development environment. Below are the npm/yarn script commands used.

```javascript
"client": "webpack-dev-server --mode development --devtool inline-source-map --hot",
"server": "nodemon src/server/index.js",
"dev": "concurrently \"npm run server\" \"npm run client\""
```

### VSCode + ESLint

[VSCode](https://code.visualstudio.com/) is a lightweight but powerful source code editor. [ESLint](https://eslint.org/) takes care of the code-quality.

### Redux Devtools

Developer Tools to power-up [Redux](https://github.com/reactjs/redux) development workflow.

It can be used as a browser extension (for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd), [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)), as [a standalone app](https://github.com/zalmoxisus/remotedev-app) or as [a React component](https://github.com/reduxjs/redux-devtools/tree/master/packages/redux-devtools) integrated in the client app.


### Infrastructure

Diagrams for our infrastructure setup can be found [here](https://lucid.app/lucidchart/81dee53d-5fdc-4c79-a3ca-018287531ab3/view?page=0_0#).