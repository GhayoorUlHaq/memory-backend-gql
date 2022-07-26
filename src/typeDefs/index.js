const {query} = require("./query");
const {userType, generalResponse, userInput, userLogSubscription, log, logBook, logUser, logTimeline} = require("./userTypes");
const {coverType, inputCoverType, addCoverResponse} = require("./bookTypes/coverType");
const {
    book,
    bookInput,
    addBookResponse,
    bookMember,
    userInfo,
    findBookUserResponse,
    findBookUserInput,
    BookUser,
    like,
    addCommentResponse,
    comment,
    updateBookResponse
} = require("./bookTypes/bookType");
const {
    addUserToBookRequest,
    getBookRequestsResponse,
    requestUserDetail,
    requestBookDetail,
    requestDetail,
    addUserToBookRequestResponse
} = require("./requestTypes/requestType");
const {
    timeLine,
    timeLineInput,
    addTimelineResponse,
    imageType,
    getTimeLineResponse,
    editTimeLineInput,
    timeLineUser,
    timelineSubscription
} = require('./bookTypes/timeLineType')
const typeDefs = [
    query,
    userType,
    generalResponse,
    userInput,
    coverType,
    inputCoverType,
    addCoverResponse,
    book,
    like,
    comment,
    addCommentResponse,
    timeLine,
    timeLineInput,
    addTimelineResponse,
    imageType,
    getTimeLineResponse,
    editTimeLineInput,
    bookInput,
    addBookResponse,
    findBookUserResponse,
    addUserToBookRequest,
    findBookUserInput,
    BookUser,
    getBookRequestsResponse,
    requestUserDetail,
    requestDetail,
    requestBookDetail,
    addUserToBookRequestResponse,
    bookMember,
    userInfo,
    timeLineUser,
    timelineSubscription,
    userLogSubscription,
    updateBookResponse,
    log,
    logBook,
    logUser,
    logTimeline,
];

module.exports = {
    typeDefs,
};
