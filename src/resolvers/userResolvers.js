const { getToken, encryptPassword, comparePassword, verifyToken, uploadImageToCloudinary } = require("../util")
const db = require('../db');
const Types = require('mongodb');

const {
    AuthenticationError,
    UserInputError
} = require('apollo-server');

const BOOK = 'book'
const USER = 'user'
const USER_LOGS= 'userLogs';

const userResolvers = {
    Query: {
        user: (parent, args, context, info) => {
            const payload = verifyToken(args?.token)
            // if (payload?.loggedIn) {
            if (context?.user?.loggedIn) {
                return payload
            } else {
                throw new AuthenticationError("Please login to get data")
            }
        },
        getUserLogs: async (parent, args, context, info) => {   //return book invites of users
            try {
                // if (context?.user?.loggedIn) {
                if (true) {
                    let data = await db.getCollection(USER_LOGS).aggregate([
                        { $match: { toUser_id: Types.ObjectId(context?.user?._id) }},
                        { $lookup: {
                                "from": BOOK,
                                localField: "book_id",
                                foreignField: "_id",
                                as: "book",
                            }},
                        { $lookup: {
                                "from": USER,
                                localField: "fromUser_id",
                                foreignField: "_id",
                                as: "user",
                            }},
                        { $project :
                                {
                                    "action": 1,
                                    "timestamp": 1,
                                    "timeLine_id": 1,
                                    "book._id": 1,
                                    "book.title": 1,
                                    "book.cover": 1,
                                    "book.timeLine": 1,
                                    "user._id": 1,
                                    "user.name": 1 ,
                                    "user.profileImage": 1,
                                    timeLine: {
                                        $map: {
                                            input: "$book",
                                            as: "i",
                                            in: {
                                                $first: {
                                                    $filter: {
                                                        input: "$$i.timeLine",
                                                        as: "item",
                                                        cond: {$eq: ["$$item.id", "$timeLine_id"]}
                                                    }
                                                }
                                            }
                                        }
                                    },
                                }
                        },
                        { "$sort": { "timestamp": -1 } },
                    ]).toArray();
                    console.log('userlogs', data);
                    console.log('userlogs', data[0].User);
                    console.log('userlogs', data[0].book);
                    console.log('userlogs', data[0].timeLine);
                    // console.log('userlogs', data[0].book[0].timeLine[0].id);
                    if(data.length > 0) {
                        return {status: true, message: 'Requests found', log: data}
                    } else {
                        return {status: false, message: 'No requests found', log: null}
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
        register: async (parent, args, context, info) => {
            const newUser = { username: args.username, password: await encryptPassword(args.password), name: args.name }
            // Check conditions
            const user = await db.getCollection('user').findOne({ username: args.username })
            if (user) {
                throw new AuthenticationError("User Already Exists!")
            }
            try {
                const regUser = (await db.getCollection('user').insertOne(newUser)).ops[0]
                const token = getToken(regUser);
                return { ...regUser, token }
            } catch (e) {
                throw e
            }
        },
        login: async (parent, args, context, info) => {
            const user = await db.getCollection('user').findOne({ username: args.username })
            if(!user?.password) throw new AuthenticationError(`Username or password is incorrect`)
            const isMatch = await comparePassword(args.password, user.password)
            if (isMatch) {
                const token = getToken(user)
                return {
                    _id: user?._id,
                    username: user?.username,
                    token,
                    bio: user?.bio,
                    name: user?.name,
                    location: user?.location,
                    profileImage: user?.profileImage
                };
            } else {
                throw new AuthenticationError("Username or password is incorrect")
            }
        },
        changePassword: async (parent, args, context, info) => {
            if (context?.user?.loggedIn) {
                let password = await encryptPassword(args.password);
                const isMatch = await comparePassword(args.password, payload.password)
                if(isMatch){
                    throw new UserInputError('Trying to set previous password. Please try new one.');
                }
                const query = { username: payload?.username }
                const update = {
                    $set: {
                        password
                    }
                }
                await db.getCollection('user').updateOne(query, update, (err, res)=>{
                    if(err) throw err;
                });
                return {
                    status: true,
                    message: 'Password changed successfully!'
                }
            } else {
                throw new AuthenticationError("Token is not valid.")
            }
        },
        checkUsernameAvailability: async (parent, args, context, info) => {
            const user = await db.getCollection('user').findOne({ username: args.username })
            if (user) {
                return {
                    status: false,
                    message: 'Username is already taken.',
                }
            }else{
                return {
                    status: true,
                    message: 'Username available.'
                }
            }
        },
        validateToken: async (parent, args, context, info) => {
            if (context?.user?._id) {
                return {
                    status: true,
                    message: 'Token is Valid'
                }
            }else{
                return {
                    status: true,
                    message: 'Token is invalid'
                }
            }
        },
        updateUser: async (parent, args, context, info) => {
            if (context?.user?._id) {
                const query = { _id: Types.ObjectId(context?.user?._id) }
                // console.log('updated field', args?.user);
                const userObj = JSON.parse(JSON.stringify(args?.user));
                if(args?.user?.profileImage){
                    userObj.profileImage = await uploadImageToCloudinary(args?.user.profileImage, 'Profile_Image')
                }
                const update = {
                    $set: {...userObj}
                }
                const added = await db.getCollection('user').updateOne(query, update);
                if(added?.result?.nModified === 1){
                    const user = await db.getCollection('user').findOne({ _id: Types.ObjectId(context?.user?._id) })
                    // console.log('user', user);
                    return { username: user?.username, bio: user?.bio, name: user?.name, location: user?.location, profileImage: user?.profileImage };
                }else if(added?.result?.nModified === 0){
                    return {
                        status: false,
                        message: 'Nothing to change in Profile',
                    }
                }else{
                    return {
                        status: false,
                        message: 'Error updating Profile',
                    }
                }
            }else{
                return {
                    status: true,
                    message: 'Token is invalid'
                }
            }
        },
    }
};

module.exports = {
    userResolvers,
}
