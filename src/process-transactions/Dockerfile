# Use the official AWS Lambda Node.js 20 image as the base image
FROM amazon/aws-lambda-nodejs:20

# Copy your TypeScript source code
COPY . ./

# Build your TypeScript project (using esbuild)
RUN npm install
RUN npx esbuild --bundle index.ts --platform=node --target=node20 --outfile=index.js

# Set the command to start the Lambda Runtime Interface Emulator
CMD ["index.handler"]
