# That is why we tell node here to use the current node image as base.
FROM node:alpine3.11

# Create an application directory
RUN mkdir -p /app

# The /app directory should act as the main application directory
WORKDIR /app

# Copy the app
COPY . /app

# Install node packages
RUN npm install

# Build the app
RUN npx webpack build

EXPOSE 8080

# Start the app
CMD ["npx", "webpack", "serve", "--host", "0.0.0.0", "--disable-host-check"]
