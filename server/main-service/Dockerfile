FROM node:20.19.0-alpine3.21

# System dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Start the server
CMD ["npm", "run", "start"]
