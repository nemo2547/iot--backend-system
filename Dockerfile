# Stage 1: Build & Install dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# คัดลอก package files และติดตั้ง dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# คัดลอก Source Code ทั้งหมด และสร้าง Prisma Client
COPY . .
RUN npx prisma generate

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# คัดลอกเฉพาะ node_modules และ Source code ที่จำเป็นจาก Stage แรก
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]