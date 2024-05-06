FROM oven/bun:alpine AS builder

WORKDIR /usr/src/demarchy/packages/jobs
COPY packages/jobs .

WORKDIR /usr/src/demarchy/packages/types
COPY packages/types .

WORKDIR /usr/src/demarchy
COPY package.json .

RUN bun install

WORKDIR /usr/src/demarchy/packages/jobs
CMD ["bun", "run", "index.ts"]