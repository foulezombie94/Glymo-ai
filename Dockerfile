# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Export Expo Web
RUN npx expo export --platform web

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install production server dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy build artifacts and server script
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Set Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
