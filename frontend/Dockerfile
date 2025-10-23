FROM node:22
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install --include=dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
