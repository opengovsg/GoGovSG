FROM node:18-alpine3.18

LABEL maintainer="Open Government Products" email="go@open.gov.sg"

# Inject ASSET_VARIANT via build arguments for production
ARG __ASSET_VARIANT
ENV ASSET_VARIANT=${__ASSET_VARIANT:-gov}

ARG __DD_SERVICE
ENV DD_SERVICE=${__DD_SERVICE}

ARG __DD_ENV
ENV DD_ENV=${__DD_ENV}

WORKDIR /usr/src/gogovsg

# For Express server
EXPOSE 8080

# For dev webpack server only, proxies to localhost:8080
EXPOSE 3000

RUN apk update && apk add font-freefont && rm -rf /var/cache/apk/*

# Installs IBMPlexSans-Regular.otf for QRCodeService.
RUN wget https://github.com/IBM/plex/blob/master/packages/plex-sans/fonts/complete/otf/IBMPlexSans-Regular.otf?raw=true -O /usr/share/fonts/freefont/IBMPlexSans-Regular.otf
RUN fc-cache -f

# Install libraries
COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . ./

RUN { \
  echo "Building..."; \
  npm run build; \
  echo "Removing devDependencies for production..."; \
  npm prune --production --legacy-peer-deps; \
}

# Builds and starts Node server for production
CMD ["npm", "run", "start"]
