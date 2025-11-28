# Builder Stage
FROM node:18-alpine AS builder
WORKDIR /build

COPY package*.json .
RUN npm install

COPY tsconfig.json .
COPY src ./src

RUN npx tsc -b


# Runner Stage
FROM node:18-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /build/dist ./dist

CMD ["node","dist/index.js"]
