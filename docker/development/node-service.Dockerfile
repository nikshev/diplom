FROM node:18-alpine

ARG SERVICE_DIR
WORKDIR /app

COPY ${SERVICE_DIR}/package*.json ./

RUN npm install

COPY ${SERVICE_DIR}/. ./
COPY shared/ ./shared/

# Default command, can be overridden in docker-compose
CMD ["npm", "run", "dev"]
