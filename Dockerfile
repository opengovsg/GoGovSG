FROM node:24-alpine3.24@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43

LABEL maintainer="Open Government Products" email="go@open.gov.sg"

# Inject ASSET_VARIANT via build arguments for production
ARG __ASSET_VARIANT
ENV ASSET_VARIANT=${__ASSET_VARIANT:-gov}

ARG __DD_SERVICE
ENV DD_SERVICE=${__DD_SERVICE}

ARG __DD_ENV
ENV DD_ENV=${__DD_ENV}

ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

ENV DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} 
ENV DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

WORKDIR /usr/src/gogovsg

# For Express server
EXPOSE 8080

# For dev webpack server only, proxies to localhost:8080
EXPOSE 3000

RUN apk update && apk add font-freefont && rm -rf /var/cache/apk/*

# Installs IBMPlexSans-Regular.otf for QRCodeService. Pinned to a commit (not
# the mutable `master` branch) with a checksum check IBM doesn't publish one
# of its own, so this hardcodes the hash of that exact commit's file.
RUN wget "https://github.com/IBM/plex/blob/bf260093582f04622aacc1e9f9ca604d7ccd0c42/packages/plex-sans/fonts/complete/otf/IBMPlexSans-Regular.otf?raw=true" -O /usr/share/fonts/freefont/IBMPlexSans-Regular.otf && \
  echo "6b17a35a31ded2e81b3ed19e5eb532d22b9a0b5a76833b0d757a5c71ab5e0f6c  /usr/share/fonts/freefont/IBMPlexSans-Regular.otf" | sha256sum -c -
RUN fc-cache -f

# Install libraries
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare pnpm@12.0.0 --activate
RUN pnpm install --frozen-lockfile

COPY . ./

RUN { \
  echo "Building..."; \
  pnpm run build; \
  echo "Removing devDependencies for production..."; \
  pnpm prune --prod; \
  }

# Builds and starts Node server for production
CMD ["pnpm", "run", "start"]
