# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_SOCKET_URL=http://localhost:3001
ARG VITE_ORCHESTRATE_URL=http://localhost:8000/api/orchestrate
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_ORCHESTRATE_URL=$VITE_ORCHESTRATE_URL

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
