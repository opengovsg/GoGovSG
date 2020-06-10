FROM gitpod/workspace-postgres

# Install Redis and libsasl2 (for localstack)
RUN sudo apt-get update \
 && sudo apt-get install -y redis-server \
 && sudo apt-get install -y libsasl2-dev \
 && sudo rm -rf /var/lib/apt/lists/*

RUN sudo mkdir -p /docker-entrypoint-initaws.d
RUN sudo chown gitpod /docker-entrypoint-initaws.d

RUN pip install "localstack[full]"

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
ENV AWS_S3_BUCKET=local-bucket
ENV ROTATED_LINKS=whatsapp,passport,spsc,sppr

# localstack env vars
ENV SERVICES=s3
ENV DEBUG=1
ENV DATA_DIR=/tmp/localstack/data
ENV HOSTNAME_EXTERNAL=localstack
ENV AWS_BUCKET_NAME=local-bucket
ENV AWS_ACCESS_KEY_ID=foobar
ENV AWS_SECRET_ACCESS_KEY=foobar
ENV PORT_WEB_UI=8055

ENV BUCKET_ENDPOINT=http://localhost:4566

RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh > /tmp/wait-for-it.sh
RUN chmod 755 /tmp/wait-for-it.sh
