# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 2617
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "2617"]
