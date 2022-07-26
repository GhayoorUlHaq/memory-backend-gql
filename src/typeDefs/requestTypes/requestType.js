const {gql} = require("apollo-server");

const addUserToBookRequest = gql`
    input AddUserToBookRequest {
        book_id: String!
        invited_id: String!
        type: String!
    }
`

const addUserToBookRequestResponse = gql`
    type AddUserToBookRequestResponse {
    status: Boolean!
    message: String!
    request_id: String
  }
`

const requestBookDetail = gql`
    type RequestBookDetail {
        _id: String
        cover: String
        title: String
    }
`;

const requestUserDetail = gql`
    type RequestUserDetail {
        _id: String
        name: String
        profileImage: String
    }
`;

const requestDetail = gql`
    type RequestDetail {
        _id: String!
        book: RequestBookDetail
        User: RequestUserDetail
        timestamp: String!
    }
`;
const getBookRequestsResponse = gql`
    type GetBookRequestsResponse {
    status: Boolean!
    message: String!
    requests: [RequestDetail]
  }
`
module.exports = {
    addUserToBookRequest,
    addUserToBookRequestResponse,
    getBookRequestsResponse,
    requestDetail,
    requestUserDetail,
    requestBookDetail,
};
