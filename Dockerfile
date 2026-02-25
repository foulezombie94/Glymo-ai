# Base image for Node.js
FROM reactnativecommunity/react-native-android:latest

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application (including android folder)
COPY . .

# Set environment variables if needed
ENV NODE_ENV=production

# The container doesn't need to run a server for a native build, 
# but it must exist and be valid for the build engine.
# We can just use a simple command to keep it alive or exit gracefully.
CMD ["node", "-v"]
