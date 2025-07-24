# Build stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the production-ready files
RUN npm run build

# Production stage - lightweight container
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only built files and package.json for serving
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies (optional, mostly empty for vite preview)
RUN npm install --omit=dev

# Expose port 2617 for the preview server
EXPOSE 2617

# Start the app using vite preview (serves ./dist)
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "2617"]
