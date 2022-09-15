FROM node:14-alpine3.16

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

RUN apk update && apk add ttf-freefont && rm -rf /var/cache/apk/*

# Installs IBMPlexSans-Regular.ttf for QRCodeService.
RUN wget https://github.com/IBM/plex/blob/master/IBM-Plex-Sans/fonts/complete/ttf/IBMPlexSans-Regular.ttf?raw=true -O /usr/share/fonts/TTF/IBMPlexSans-Regular.ttf
RUN fc-cache -f

# Install libraries
COPY package.json package-lock.json ./

RUN npm ci

COPY . ./

RUN { \
  echo "Building..."; \
  npm run build; \
  echo "Removing devDependencies for production..."; \
  npm prune --production; \
}

# Builds and starts Node server for production
CMD ["npm", "run", "start"]
