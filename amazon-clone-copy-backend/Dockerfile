# Use official Node LTS image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src ./src

# Copy frontend into the image if present in repo root
# If you keep frontend next to backend in the repo, Docker context should include it
COPY ../Amazon-clone\ -\ Copy ./src/frontend/

# Expose port
EXPOSE 4000

# Environment: production
ENV NODE_ENV=production

CMD ["node", "src/app.js"]
