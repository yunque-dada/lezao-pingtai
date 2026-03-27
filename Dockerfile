FROM node:18

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

COPY backend ./
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]