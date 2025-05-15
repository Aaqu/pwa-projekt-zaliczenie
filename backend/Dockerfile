FROM node:18-alpine

WORKDIR /app

COPY . .
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]

# build     docker build -t pwa-backend .
# run       docker run -d --env-file .env -p 3000:3000 pwa-backend
# export    docker save -o pwa-backend.tar pwa-backend