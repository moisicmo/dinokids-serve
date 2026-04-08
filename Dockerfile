FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" yarn prisma generate
RUN yarn build
RUN mkdir -p public/uploads

FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.t[s] ./
COPY --from=builder /app/tsconfig.jso[n] ./
COPY --from=builder /app/public ./public
EXPOSE 4204
CMD ["sh", "-c", "yarn prisma migrate deploy && if [ -f dist/main.js ]; then node dist/main; else node dist/src/main; fi"]
