# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.18.0 --activate
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/root/.yarn/berry/cache yarn install --immutable
COPY tsconfig.json ./
COPY public ./public
COPY src ./src
# Public browser configuration, never secrets. Empty API URL uses the same origin.
ARG REACT_APP_API_URL=""
ARG REACT_APP_WS_URL=localhost:3000
ENV REACT_APP_API_URL=${REACT_APP_API_URL} \
    REACT_APP_WS_URL=${REACT_APP_WS_URL} \
    NODE_ENV=production
RUN yarn build

FROM nginx:stable-alpine AS production
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY --from=build /app/build /usr/share/nginx/html
ENV BACKEND_URL=http://host.docker.internal:3001
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["envsubst '$BACKEND_URL' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf && exec nginx -c /tmp/nginx.conf -g 'daemon off;'"]
