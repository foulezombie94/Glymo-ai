# Stage 1: Build the Expo Web App
FROM node:18 AS builder
WORKDIR /app

# Copy package files for the root project (Expo)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all files and export for web
COPY . .
RUN npx expo export --platform web

# Stage 2: Run the Node.js Server
FROM node:18-slim
WORKDIR /app

# Copy server package files
COPY server/package*.json ./
RUN npm install

# Copy server code
COPY server/ .

# Copy the built web apps from the builder stage into server's dist folder
COPY --from=builder /app/dist ./dist

# Expose the port for Cloud Run
EXPOSE 8080
ENV PORT=8080

CMD ["node", "index.js"]
