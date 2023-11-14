const { ApolloServer, gql } = require("apollo-server-express");
const dbHandler = require("./connections");

const typeDefs = gql`
  type User {
    id: Int
    firstname: String
    lastname: String
    location: String
  }

  type Query {
    users: [User]
    user(id: Int!): User
  }

  type Mutation {
    createUser(input: UserInput): User
    updateUser(input: UserInput): User
    deleteUser(id: Int!): String
  }

  input UserInput {
    id: Int
    firstname: String
    lastname: String
    location: String
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      try {
        const query = "SELECT * FROM users";
        console.log("executing query:", query);
        const users = await dbHandler.query(query);
        console.log("Query result:", users.rows);
        return users.rows;
      } catch (error) {
        console.error("Error querying the database:", error);
        throw new Error("Failed to fetch users");
      }
    },
    user: async (parent, args, context) => {
      try {
        const query = "SELECT * FROM users WHERE id = $1";
        const { id } = args;
        const user = await dbHandler.query(query, [id]);
        return user.rows[0];
      } catch (error) {
        console.error("Error querying the database:", error);

        throw new Error("Failed to fetch user by ID");
      }
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const { id, firstname, lastname, location } = input;
      const query =
        "INSERT INTO users (id, firstname, lastname, location) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [id, firstname, lastname, location];
      const createdUser = await dbHandler.query(query, values);
      return createdUser.rows[0];
    },
    updateUser: async (_, { input }) => {
      const { id, firstname, lastname, location } = input;
      const query =
        "UPDATE users SET firstname = $2, lastname = $3, location = $4 WHERE id = $1 RETURNING *";
      const values = [id, firstname, lastname, location];
      const updatedUser = await dbHandler.query(query, values);
      return updatedUser.rows[0];
    },
    deleteUser: async (_, { id }) => {
      const query = "DELETE FROM users WHERE id = $1";
      await dbHandler.query(query, [id]);
      return "User deleted successfully";
    },
  },
};

module.exports = { typeDefs, resolvers };
