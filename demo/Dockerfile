FROM node:alpine AS builder

RUN mkdir -p /app
COPY . /app

WORKDIR /app/examples/reactjs

RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/examples/reactjs/build/ /usr/share/nginx/html/
COPY ./demo/nginx.conf /etc/nginx/conf.d/default.conf
