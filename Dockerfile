# Build frontend
FROM node:18 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Build backend
FROM node:18 as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
RUN npm run build

# Final image
FROM node:18
WORKDIR /app

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy backend build
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/package*.json ./backend/

# Install backend dependencies (production only)
WORKDIR /app/backend
RUN npm ci --only=production

# Expose port
EXPOSE 5000

# Start backend server
CMD ["npm", "start"]