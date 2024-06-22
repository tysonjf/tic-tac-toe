# Stage 1: Base
FROM node:20 AS base
WORKDIR /app
COPY . .
RUN npm run install:server

# Stage 2: Development
FROM base AS development
COPY . .
WORKDIR /app/packages/server
CMD ["npm", "run", "dev"]

# Stage 3: Build and node run dist/index.js
FROM base AS build
COPY . .
WORKDIR /app/packages/server
RUN npm run build

# Stage 4: Production, start the node server
FROM build AS production
WORKDIR /app/packages/server
CMD ["node", "dist/index.js"]
