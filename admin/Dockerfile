FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY api/package.json api/
COPY admin/package.json admin/
COPY landing/package.json landing/

RUN npm ci

COPY admin ./admin
ARG VITE_PUBLIC_API_URL=/api
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL
RUN npm run build --workspace=widamine-admin

FROM nginx:1.27-alpine AS runner
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
