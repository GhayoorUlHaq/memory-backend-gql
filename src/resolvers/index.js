const { userResolvers } = require('./userResolvers');
const {bookResolvers} = require('./bookResolvers')
const {requestResolvers} = require("./requestResolvers");
const {feedbackResolvers} = require("./feedbackResolvers");
const resolvers = [userResolvers, bookResolvers, requestResolvers, feedbackResolvers];

module.exports = {
  resolvers,
};
