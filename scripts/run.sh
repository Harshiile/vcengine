#!/bin/bash

echo "Starting Docker containers..."
docker compose -f docker-compose-services.yaml up -d

echo "Starting Redis workers..."
concurrently \
  "node dist/redis/workers/mail_worker.js" \
  "node dist/redis/workers/version_worker.js" &

echo "Building server..."
tsc -b

echo "Starting main server..."
node dist/index.js
