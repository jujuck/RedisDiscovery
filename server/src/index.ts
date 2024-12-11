import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import AdResolver from "./resolvers/ad";
import redisClient from "./redis.config";

const start = async () => {
  await redisClient.connect();
  const schema = await buildSchema({
    resolvers: [AdResolver],
  });

  const server = new ApolloServer({ schema });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

start();
