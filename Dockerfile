FROM node:18.10.0-alpine3.16

EXPOSE 3000

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./

CMD ["npm", "run", "docker:start"]
