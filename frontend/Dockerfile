FROM node:24-alpine AS builder

WORKDIR /app

ARG VITE_API_URL

ENV VITE_API_URL=${VITE_API_URL}

COPY . .

RUN npm install && npm run build

CMD ["npm", "run", "dev", "--", "--host"]