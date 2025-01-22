const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const resolvers = require('./graphql/resolvers');
const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");
const secret = "This is secret key";


const typeDefs = fs.readFileSync(path.join(__dirname, 'graphql/schema.graphql'), 'utf8');


const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const authorization = req.headers.authorization;
    
    if (authorization) {
      try {
       
        const token = authorization.replace("Bearer ", ""); 
        const decodedToken = jwt.verify(token, secret);
  
        return { userId: decodedToken.userId };
      } catch (error) {
        console.error("Invalid token:", error.message);
       
        throw new Error("Authentication failed: Invalid or expired token.");
      }
    }
   
    console.warn("No Authorization header provided.");
    return {};
  },
});

const app = express();

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
