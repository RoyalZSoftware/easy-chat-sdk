FROM node:18.10-alpine

COPY . .

ENTRYPOINT ["npm", "start"]

EXPOSE 8081