# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose port 8000
EXPOSE 8000

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
