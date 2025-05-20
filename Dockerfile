FROM node:22-alpine AS build

# Install unzip and ca-certificates for later copying
RUN apk add --no-cache unzip ca-certificates

ARG PB_VERSION=0.28.1

# Download and unzip PocketBase in build stage
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Copy only package files and install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app for CSS build
COPY ./pb_hooks ./pb_hooks

# Build CSS
RUN npm run build:css

# Lint EJS
RUN npm run lint:ejs

# --- Final image ---
FROM alpine:latest

# Copy PocketBase binary from build stage
COPY --from=build /pb/pocketbase /pb/pocketbase
COPY --from=build /app/pb_hooks /pb/pb_hooks
COPY --from=build /app/node_modules /pb/node_modules
COPY ./pb_migrations /pb/pb_migrations

WORKDIR /pb

EXPOSE 8080

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]