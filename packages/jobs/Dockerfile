FROM oven/bun:alpine AS builder

WORKDIR /usr/src/supastarter/packages/jobs
COPY packages/jobs .

WORKDIR /usr/src/supastarter/packages/types
COPY packages/types .

WORKDIR /usr/src/supastarter
COPY package.json .

RUN bun install

WORKDIR /usr/src/supastarter/packages/jobs
CMD ["bun", "run", "index.ts"]