# syntax=docker/dockerfile:1

FROM node:20-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.js ./

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "index.js"]
