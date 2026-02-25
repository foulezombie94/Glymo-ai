# Base image for Node.js
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files for the server
COPY server/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the server source code
COPY server/ .

# Expose the port used by Cloud Run
EXPOSE 8080

# Environment variable for Cloud Run
ENV PORT=8080

# Command to start the server
CMD ["node", "index.js"]
