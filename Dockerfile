FROM node:10

# To Create nodejsapp directory
WORKDIR /backendapp

# To Install All dependencies

COPY package*.json ./

RUN npm install

# To copy all application packages 
COPY . .

EXPOSE 8080

#What's needed to run
CMD ["node", "."]
