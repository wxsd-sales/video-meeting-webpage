#docker build -t webex-meetings-server .
#docker run -i -t webex-meetings-server

FROM node:18.15.0

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install nodemon
COPY . .

#overwrite default environment variables
COPY bdm.env .env
CMD [ "npm", "run", "build" ]
CMD [ "npm", "start" ]
