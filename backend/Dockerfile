FROM node:22-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package.json ./
RUN npm install

# Copy prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy backend source and build
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npx tsc

# Compile seed.ts to seed.js so it can run in production
RUN npx tsc prisma/seed.ts --esModuleInterop --skipLibCheck --outDir prisma --resolveJsonModule

# Build frontend
WORKDIR /frontend-build
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Move frontend build into backend public folder
RUN mv /frontend-build/dist /app/public

# Cleanup
WORKDIR /app
RUN rm -rf /frontend-build
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/index.js"]
