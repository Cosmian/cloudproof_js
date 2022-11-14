FROM node:alpine

RUN mkdir -p /app
COPY . /app

WORKDIR /app/examples/reactjs

RUN npm install
RUN npm run build

EXPOSE 8090

CMD ["npm", "run", "serve"]
