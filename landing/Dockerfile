FROM node:22-alpine AS build
ARG VITE_PUBLIC_API_URL
ARG VITE_ADMIN_URL
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY landing/package.json landing/

RUN npm ci --workspace=widamine-landing

COPY landing ./landing
RUN npm run build --workspace=widamine-landing

FROM nginx:1.27-alpine AS runner
COPY landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/landing/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
