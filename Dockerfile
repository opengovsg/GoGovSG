FROM node:12-alpine3.9

LABEL maintainer="Open Government Products" email="go@open.gov.sg"

ARG BUILD_MODE

WORKDIR /usr/src/gogovsg

# For Express server
EXPOSE 8080

# For dev webpack server only, proxies to localhost:8080
EXPOSE 3000

RUN apk update && apk add python g++ make && rm -rf /var/cache/apk/*

# Install libraries
COPY package.json package-lock.json ./

RUN npm ci

COPY . ./

RUN if [ "$BUILD_MODE" != "development" ]; \
then { \
  echo "Building..."; \
  npm run build; \
  echo "Removing devDependencies for production..."; \
  npm prune --production; \
} \
fi

# Builds and starts Node server for production
CMD ["npm", "run", "start"]
