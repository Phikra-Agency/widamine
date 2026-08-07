FROM node:22-alpine AS build
ARG VITE_PUBLIC_API_URL
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY admin/package.json admin/

RUN npm ci --workspace=widamine-admin

COPY admin ./admin
RUN npm run build --workspace=widamine-admin

FROM nginx:1.27-alpine AS runner
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
