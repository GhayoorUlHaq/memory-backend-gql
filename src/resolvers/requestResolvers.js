const db = require('../db');
const Types = require('mongodb');

const {
    AuthenticationError,
} = require('apollo-server');

const REQUEST = 'request';
const BOOK = 'book';
const USER = 'user';
const USER_LOGS = 'userLogs';  //collection
const BOOK_INVITE = 'BOOK_INVITE';
const USER_LOG = 'USER_LOG'; //listener

const requestResolvers = {
    Query: {
        getBookRequests: async (parent, args, context, info) => {   //return book invites of users
            try {
                // if (context?.user?.loggedIn) {
                if (true) {
                    let data = await db.getCollection(REQUEST).aggregate([
                        { $match: { invitedToUser_id: Types.ObjectId(context?.user?._id) }},
                        { $lookup: {
                                "from": BOOK,
                                localField: "book_id",
                                foreignField: "_id",
                                as: "book",
                            }},
                        {
                            $unwind: "$book"
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "invitedByUser_id",
                                foreignField: "_id",
                                as: "User",
                            }},
                        {
                            $unwind: "$User"
                        },
                        { $project :
                                {
                                    "invitedByUser_id": 1,
                                    "book._id": 1,
                                    "book.title": 1,
                                    "book.cover": 1,
                                    "User._id": 1,
                                    "User.name": 1,
                                    "User.profileImage": 1,
                                    "timestamp": 1,
                                }
                        },
                        { "$sort": { "timestamp": -1 } },
                    ]).toArray();
                    // console.log('data', data);
                    if(data.length > 0) {
                        return {status: true, message: 'Requests found', requests: data}
                    } else {
                        return {status: false, message: 'No requests found', requests: null}
                    }

                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                console.log(e)
                throw e
            }
        },
    },
    Mutation: {
        addUserToBookRequest: async (parent, args, context, info) => {
            try {
                if(true){
                    let data = await db.getCollection(REQUEST).findOne({
                        // user_id :context?.user?._id,
                        invitedToUser_id: Types.ObjectId(args.addUser.invited_id.toString()),
                        book_id: Types.ObjectId(args.addUser.book_id.toString()),
                        type: args.addUser.type.toString(),
                    })

                    if(!data) {
                        const book = await db.getCollection(BOOK).find(
                            { 'members.user_id': Types.ObjectId(args.addUser.invited_id.toString()),
                                _id: Types.ObjectId(args.addUser.book_id.toString())}
                        ).toArray();
                        if (book.length === 0) {
                            const request = {
                                invitedByUser_id: Types.ObjectId(context?.user?._id),
                                invitedToUser_id: Types.ObjectId(args.addUser.invited_id),
                                book_id: Types.ObjectId(args.addUser.book_id),
                                type: args.addUser.type,
                                timestamp: Date.now(),
                            }

                            const added = (await db.getCollection(REQUEST).insertOne(request)).ops[0]
                            if (added._id) {
                                const query = { fromUser_id: Types.ObjectId(context?.user?._id),
                                    toUser_id: Types.ObjectId(args.addUser.invited_id),
                                    book_id: Types.ObjectId(args.addUser.book_id),
                                    action: BOOK_INVITE }

                                const update = {
                                    "$set": {
                                            fromUser_id: Types.ObjectId(context?.user?._id),
                                            toUser_id: Types.ObjectId(args.addUser.invited_id),
                                            book_id: Types.ObjectId(args.addUser.book_id),
                                            action: BOOK_INVITE,
                                            timeLine_id: null,
                                            timestamp: Date.now(),
                                    }
                                }
                                let log_added = await db.getCollection(USER_LOGS).updateOne(query,update, { upsert: true })
                                if(log_added?.result?.nModified === 1)
                                    {
                                        context.pubsub.publish(USER_LOG, {
                                            newUserLog: {
                                                user_id: args.addUser.invited_id,
                                                status: true,
                                                message: 'Book Invite',
                                            }
                                        })
                                    }
                                return {
                                    status: true,
                                    message: 'Add user to book request Added Successfully',
                                    request_id: added._id
                                }
                            } else {
                                return {status: false, message: 'Failed to add user to book request'}
                            }
                        } else {
                            return {status: false, message: 'User already member'}
                        }
                    } else {
                        return {status: false, message: 'User already requested'}
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        deleteAddUserToBookRequest: async (parent, args, context, info) => {
            try {
                if(true){
                    let data = await db.getCollection(REQUEST).findOne({
                        _id: Types.ObjectId(args.id.toString())
                    })

                    if(data) {
                        const deleted = await db.getCollection(REQUEST).deleteOne({
                            _id: Types.ObjectId(args.id.toString())
                        })

                        if(deleted?.result?.n === 1){
                            return {
                                status: true,
                                message: 'Request deleted successfully!',
                            }
                        }else if(deleted?.result?.n === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in request',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error deleting to add user to book request',
                            }
                        }
                    } else{
                        return {
                            status: true,
                            message: 'Request not found',
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        acceptAddUserToBookRequest: async (parent, args, context, info) => {
            try {
                if(true){
                    let data = await db.getCollection(REQUEST).findOne({
                        _id: Types.ObjectId(args.id.toString())
                    })

                    if(data) {
                            let memberData = {
                                user_id: Types.ObjectId(data?.invitedToUser_id),
                                role: "general"
                            }
                            const query = {_id: Types.ObjectId(data?.book_id)}
                            const update = {
                                $addToSet: {
                                    members: {...memberData}
                                }
                            }
                            const added = await db.getCollection(BOOK).updateOne(query, update);
                            if (added?.result?.nModified === 1) {
                                await db.getCollection(REQUEST).deleteOne({
                                    _id: Types.ObjectId(args.id.toString())
                                })
                                return {
                                    status: true,
                                    message: 'Member Added successfully!',

                                }
                            } else if (added?.result?.nModified === 0) {
                                return {
                                    status: false,
                                    message: 'Nothing to change in book',
                                }
                            } else {
                                return {
                                    status: false,
                                    message: 'Error adding member to book',
                                }
                            }
                        } else {
                        return {
                            status: false,
                            message: 'Request not found',
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
    }
};

module.exports = {
    requestResolvers,
}
