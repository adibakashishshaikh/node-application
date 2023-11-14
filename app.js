const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");

const dbHandler = require("./connections");
const userRouter = require("./userRouter")(dbHandler);
const { typeDefs, resolvers } = require("./graphql");

const app = express();
let server = null;
const port = Number(process.env.SERVERPORT) || 3000;

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

app.use(bodyParser.json());

// Serve React app for any other route
//app.use(express.static(path.join(__dirname, "build")));

//  userRouter for '/user' path
app.use("/user", userRouter);

// Create an Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const connectDatabase = async () => {
  try {
    await dbHandler.connect();
    await dbHandler.query("select 1");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

const startServer = async () => {
  try {
    await connectDatabase();
    console.log("Database connected  successfully");
    // Start the Apollo Server
    await apolloServer.start();

    // Apply the Apollo Server middleware
    apolloServer.applyMiddleware({ app, path: "/graphql" });

    server = app.listen({ port }, () =>
      console.log(`Server listening at port: ${port}`)
    );
  } catch (error) {
    console.error("Server startup error:", error);
    await stopServer();
  }
};

const disconnectDatabase = async () => {
  try {
    console.log("database disconnecting...");
    await dbHandler.end();
    console.log("database disconnected successfully");
  } catch (err) {
    console.log("error while disconnecting database", err);
  }
};

const stopServer = async () => {
  try {
    await disconnectDatabase();
    if (server) {
      console.log("stoping the server...");
      await server.close();
      console.log("server stopped successfully");
    }
  } catch (error) {
    console.error("Error during server shutdown :", error);
  } finally {
    process.exit(1);
  }
};

const shutdown = async (signal, value) => {
  await stopServer();
  console.log(`Server stopped by ${signal} with value ${value}`);
  process.exit(128 + value);
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Process received a ${signal} signal`);
    await shutdown(signal, signals[signal]);
  });
});

startServer();
