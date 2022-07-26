const { gql } = require("apollo-server");

const query = gql`
  type Query {
    user(token: String!): User
    platformCovers: [Cover]
    books: [Book]
    getPublicBooks: [Book]
    book(book_id: String!): Book
    getBookRequests: GetBookRequestsResponse
    getSharedBooks: [Book]
    getUserLogs: UserLogSubscription
  }
  type Mutation {
    register(username: String!, password: String!, name: String!): User
    login(username: String!, password: String!): User
    changePassword(token: String!, password: String!): GeneralResponse
    checkUsernameAvailability(username: String!): GeneralResponse
    validateToken: GeneralResponse
    updateUser(user: UserInput) : User
    findBookUser(user: InputFindBookUser): FindBookUserResponse
    addPlatformCovers(cover: InputCover): GeneralResponse
    addBook(book: InputBook): AddBookResponse
    deleteBook(book_id: String!): GeneralResponse
    updateBook(book_id: String!, cover: String, title: String, privacy: String): updateBookResponse 
    addBookCover(cover: InputCover): AddCoverResponse
    addTimeLinePost(timeLine: InputTimeline): AddTimelineResponse
    deleteTimeLinePost(id: String!): GeneralResponse
    deleteUserFromBook(user_id: String!, book_id: String!): GeneralResponse
    addLikeToBook(book_id: String!): GeneralResponse
    deleteLikeFromBook(book_id: String!): GeneralResponse
    addCommentToBook(book_id: String!, comment: String!): AddCommentResponse
    deleteCommentFromBook(book_id: String!, comment_id: String!): GeneralResponse
    updateCommentOnBook(comment_id: String!, comment: String!): GeneralResponse
    updateTimeLinePost(timeLine: EditTimeline): AddTimelineResponse
    addLikeToTimeLine(timeLine_id: String!): GeneralResponse
    deleteLikeFromTimeLine(timeLine_id: String!): GeneralResponse
    addCommentToTimeLine(timeLine_id: String!, comment: String!): AddCommentResponse
    deleteCommentFromTimeLine(comment_id: String!): GeneralResponse
    updateCommentOnTimeline(timeLine_id: String!, comment_id: String!, comment: String!): GeneralResponse
    addUserToBookRequest(addUser: AddUserToBookRequest): AddUserToBookRequestResponse
    deleteAddUserToBookRequest(id: String!): GeneralResponse
    acceptAddUserToBookRequest(id: String!): GeneralResponse
    addFeedback(email: String!, message: String!): GeneralResponse
  }

  type Subscription {
    newTimeLine(book_id: String!): TimelineSubscription
    newUserLog: GeneralResponse
  }
`;

module.exports = {
  query,
};
