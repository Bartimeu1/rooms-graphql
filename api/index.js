import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { roomsData } from '../data/rooms.js';

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = http.createServer(app);

const typeDefs = gql`
  type Room {
    id: ID!
    title: String!
    price: String!
    available: Boolean!
    rating: Int!
    reviews: Int!
    info: String!
    image: String!
  }

  type PaginatedRooms {
    items: [Room!]!
    totalCount: Int!
  }

  type Query {
    rooms(offset: Int!, limit: Int!): PaginatedRooms!
    roomById(id: ID!): Room!
    roomsIds: [ID!]!
  }
`;

const resolvers = {
  Query: {
    rooms: (_, { offset, limit }) => {
      const paginatedRooms = roomsData.slice(offset, offset + limit);
      return {
        items: paginatedRooms,
        totalCount: roomsData.length,
      };
    },
    roomById: (_, { id }) => roomsData.find((room) => room.id === id),
    roomsIds: () => roomsData.map((room) => room.id),
  },
};

const startApolloServer = async (app, httpServer) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });
};

startApolloServer(app, httpServer);

export default httpServer;
