const { ApolloServer, PubSub } = require('apollo-server');
const { typeDefs } = require("./typeDefs/index");
const { resolvers } = require("./resolvers");
const db = require('./db');
const config = require('./config');
const {verifyToken} = require('../src/util')

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true, // specified to access playground in production
  context: ({req, connection}) => {

    // Connect to DB
    db.connect(config.database, (err) => {
      if (err) {
        console.error(err)
      }else{
        console.log('Connection to Mongo DB Successful')
      }
    })

    // get the user token from the headers
    let user = {};
    if (connection) { // Operation is a Subscription
      // Obtain connectionParams-provided token from connection.context
      const token = connection.context.authorization || "";
      if(token?.length > 0){
        user = verifyToken(token)
      }
    } else { // Operation is a Query/Mutation
      // Obtain header-provided token from req.headers
      const token = req.headers.authorization || "";
      if(token?.length > 0){
        user = verifyToken(token)
      }
    }
    // add the user to the context
    return { user, pubsub };
  },
  subscriptions: {
    path: '/subscriptions'
  },
});

server.listen(process.env.PORT || 4000);

console.log("👉 http://localhost:4000")
