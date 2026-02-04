FROM node:20

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Set environment defaults
ENV NODE_ENV=development
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "docker-start"]
