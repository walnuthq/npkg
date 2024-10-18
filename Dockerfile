# Use Node.js base image
FROM node:22.8.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY src ./src
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Build the Nest.js app
RUN yarn build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"]
