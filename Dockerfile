FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY api/package.json api/
COPY admin/package.json admin/
COPY landing/package.json landing/

RUN npm ci

COPY landing ./landing

ARG VITE_PUBLIC_API_URL=/api
ARG VITE_ADMIN_URL=http://localhost:8080
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL

RUN npm run build --workspace=widamine-landing

FROM nginx:1.27-alpine AS runner
COPY landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/landing/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
