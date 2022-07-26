const { gql } = require("apollo-server");

const userType = gql`
  type User {
    username: String!
    token: String!
    name: String!
    bio: String
    location: String  
    profileImage: String  
    _id: String
    requestStatus: String
  }
`

const userInput = gql`
  input UserInput {
    name: String
    bio: String
    location: String
    profileImage: String
  }
`

const generalResponse = gql`
  type GeneralResponse {
    status: Boolean!
    message: String!
  }
`

const logBook = gql`
  type LogBook {
    _id: String!
    cover: String!
    title: String!
  }
`

const logUser = gql`
  type LogUser {
    _id: String!
    name: String!
    profileImage: String!
  }
`

const logTimeline = gql`
  type LogTimeline {
    id: String!
    title: String!
  }
`

const log = gql`
  type Log {
    _id: String!
    timestamp: String!
    action: String!
    book: [LogBook]
    user: [LogUser]
    timeLine: [LogTimeline]
  }
`

const userLogSubscription = gql`
  type UserLogSubscription {
    status: Boolean!
    message: String!
    log: [Log]
  }
`

module.exports = {
  userType,
  generalResponse,
  userInput,
  userLogSubscription,
  log,
  logTimeline,
  logUser,
  logBook
};
