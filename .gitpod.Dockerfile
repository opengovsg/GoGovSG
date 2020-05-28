FROM gitpod/workspace-postgres

# Install Redis.
RUN sudo apt-get update \
 && sudo apt-get install -y \
  redis-server \
 && sudo rm -rf /var/lib/apt/lists/*

USER gitpod

ENV NODE_ENV=development
ENV PORT=8080
ENV DB_URI=postgres://0.0.0.0:5432/postgres
ENV REDIS_OTP_URI=redis://0.0.0.0:6379/0
ENV REDIS_SESSION_URI=redis://0.0.0.0:6379/1
ENV REDIS_REDIRECT_URI=redis://0.0.0.0:6379/2
ENV REDIS_STAT_URI=redis://0.0.0.0:6379/3
ENV SESSION_SECRET=thiscouldbeanything
ENV GA_TRACKING_ID=UA-139330318-1
ENV OG_URL=https://go.gov.sg
ENV VALID_EMAIL_GLOB_EXPRESSION=*.gov.sg
ENV AWS_S3_BUCKET=file-staging.go.gov.sg
ENV ROTATED_LINKS=whatsapp,passport,spsc,sppr
