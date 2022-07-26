const {gql} = require("apollo-server");

const imageType = gql`
    type TimeLineImage {
        id: String
        url: String
    }
`

const timeLineUser = gql`
type TimeLineUser {
    _id: String
    name: String
    profileImage: String
}
`

const timeLine = gql`
type Timeline {
    title: String
    image: [TimeLineImage]
    description: String
    id: String
    timestamp: String
    createdBy: TimeLineUser
    likes: [Like]
    comments: [Comment]
}
`

const getTimeLineResponse = gql`
    type GetTimeLineResponse {
        timeLine: [Timeline]
    }
`

const addTimelineResponse = gql`
    type AddTimelineResponse {
        status: Boolean!
        message: String!
        id: String!
        image: [TimeLineImage]
        createdBy: String
        timestamp: String
  }
`

const timeLineInput = gql`
input InputTimeline {
    title: String
    image: [String]
    description: String
    book_id: String
  }
`

const editTimeLineInput = gql`
input EditTimeline {
    title: String
    image: [String]
    deletedImages: [String]
    description: String
    timeLineId: String!
  }
`

const timelineSubscription = gql`
type TimelineSubscription {
    newTimeLine: Timeline
    action: String
}
`

module.exports = {
    timeLine,
    timeLineInput,
    addTimelineResponse,
    imageType,
    getTimeLineResponse,
    editTimeLineInput,
    timeLineUser,
    timelineSubscription
};
