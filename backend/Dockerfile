FROM node:18
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
EXPOSE 5000
CMD ["npm", "run", "start"]