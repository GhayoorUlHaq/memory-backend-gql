const {gql} = require("apollo-server");

const bookMember = gql`
    type BookMember {
    _id: String
    role: String
    username: String
    name: String
    profileImage: String
  }
`

const userInfo = gql`
    type UserInfo {
    _id: String
    username: String
    name: String
    bio: String
    location: String
    profileImage: String
  }
`

const like = gql`
    type Like {
    _id: String!
    name: String
    profileImage: String
    username: String
  }
`

const comment = gql`
    type Comment {
    id: String!
    name: String
    profileImage: String
    comment: String
    timestamp: String
    user_id: String
  }
`

const book = gql`
    type Book {
    _id: String
    user_id: String
    cover: String
    title: String
    privacy: String
    timestamp: String
    likes: [Like]
    comments: [Comment]
    timeLine: [Timeline]
    members: [BookMember]
    userInfo: UserInfo
    canEdit: Boolean
  }
`

const bookInput = gql`
input InputBook {
    title: String!
    cover: String!
    privacy: String!
  }
`
const addBookResponse = gql`
    type AddBookResponse {
    status: Boolean!
    message: String!
    id: String!
  }
`

const updateBookResponse = gql`
    type updateBookResponse {
    status: Boolean!
    message: String!
    cover: String!
  }
`

const findBookUserInput = gql`
input InputFindBookUser {
    username: String!
    book_id: String!
  }
`

const BookUser = gql`
  type BookUser {
    _id: String
    username: String
    name: String
    profileImage: String
    isRequested: String
    isMember: String
  }
`

const findBookUserResponse = gql`
  type FindBookUserResponse {
    status: Boolean!
    message: String!
    users: [BookUser]
  }
`

const addCommentResponse = gql`
    type AddCommentResponse {
    status: Boolean!
    message: String!
    id: String!
    timestamp: String
  }
`

module.exports = {
    book,
    bookInput,
    addBookResponse,
    bookMember,
    userInfo,
    findBookUserInput,
    findBookUserResponse,
    BookUser,
    like,
    comment,
    addCommentResponse,
    updateBookResponse,
};
