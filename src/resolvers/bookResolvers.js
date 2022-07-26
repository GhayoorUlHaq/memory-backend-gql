const { uploadImageToCloudinary, uploadMultipleImages, deleteImageFromCloudinary, getImagePublicId } = require("../util")
const db = require('../db');
const Types = require('mongodb');


const {
    AuthenticationError,withFilter
} = require('apollo-server');

const PLATFORM_COVERS = 'platformCovers'
const BOOK = 'book'
const USER = 'user'
const REQUEST = 'request';
const TIMELINE = 'TIMELINE';
const NEW_TIMELINE = 'NEW_TIMELINE';
const DELETE_TIMELINE = 'DELETE_TIMELINE';
const UPDATE_TIMELINE = 'UPDATE_TIMELINE';
const ADD_TIMELINE_LIKE = 'ADD_TIMELINE_LIKE';
const DELETE_TIMELINE_LIKE = 'DELETE_TIMELINE_LIKE';
const ADD_TIMELINE_COMMENT = 'ADD_TIMELINE_COMMENT';
const DELETE_TIMELINE_COMMENT = 'DELETE_TIMELINE_COMMENT';
const UPDATE_TIMELINE_COMMENT = 'UPDATE_TIMELINE_COMMENT';
const USER_LOG = 'USER_LOG';
const USER_LOGS = 'userLogs';  //collection
const TIMELINE_LIKE = 'TIMELINE_LIKE';

const bookResolvers = {
    Subscription: {
        newTimeLine: {
            subscribe: withFilter((parent, args, context) => context.pubsub.asyncIterator(TIMELINE),
                (payload, variables) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation
                    console.log("payload - > ",payload)
                    return (payload.newTimeLine.newTimeLine.book_id === variables.book_id);
                },)
        },
        newUserLog: {
            subscribe: withFilter((parent, args, context) => context.pubsub.asyncIterator(USER_LOG),
                (payload, variables, context) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation
                    console.log("payload - > ",payload)
                    console.log('context',context?.user?._id.toString() )
                    return (payload?.newUserLog?.user_id?.toString() === context?.user?._id.toString());
                },)
        }
    },
    Query: {
        platformCovers: async (parent, args, context, info) => {
            try {
                // if (context?.user?.loggedIn) {
                if (true) {
                    let payload = []
                    let data = await db.getCollection(PLATFORM_COVERS).find({})
                    await data.toArray().then(res => {
                        payload = res
                    })
                    return payload;
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                console.log(e)
                throw e
            }
            // if (context?.user?.loggedIn) {
        },
        books: async (parent, args, context, info) => {
            try {
                // if (context?.user?.loggedIn) {
                if (true) {
                    let data = await db.getCollection(BOOK).aggregate([
                        { $match: {user_id: Types.ObjectId(context?.user?._id)}},
                        { $lookup: {
                                "from": USER,
                                localField: "user_id",
                                foreignField: "_id",
                                as: "userInfo",
                            }
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "likes.user_id",
                                foreignField: "_id",
                                as: "likes",
                            }
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "comments.user_id",
                                foreignField: "_id",
                                as: "commentUserInfo",
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                cover: 1,
                                title: 1,
                                privacy: 1,
                                userInfo: 1,
                                likes: 1,
                                timestamp: 1,
                                comments: {
                                    $map: {
                                        input: "$comments",
                                        as: "i",
                                        in: {
                                            $mergeObjects: [
                                                "$$i",
                                                {
                                                    $first: {
                                                        $filter: {
                                                            input: "$commentUserInfo",
                                                            cond: {$eq: ["$$this._id", "$$i.user_id"]}
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                            }
                        },
                        {
                            $unwind: "$userInfo"
                        },
                        { $project : {"userInfo.password" : 0, "likes.password" : 0, "comments.username" : 0,
                                "comments.password" : 0, "comments.bio" : 0, "comments._id" : 0 } },
                        {$sort: {timestamp: 1}}
                    ]).toArray();
                    console.log('data', data)
                    return data;
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                console.log(e)
                throw e
            }
        },
        getPublicBooks: async (parent, args, context, info) => {
            try {
                // if (context?.user?.loggedIn) {
                if (true) {
                    let data = await db.getCollection(BOOK).aggregate([
                        { $match: {privacy: 'public'}},
                        { $lookup: {
                                "from": USER,
                                localField: "user_id",
                                foreignField: "_id",
                                as: "userInfo",
                            }
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "likes.user_id",
                                foreignField: "_id",
                                as: "likes",
                            }
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "comments.user_id",
                                foreignField: "_id",
                                as: "commentUserInfo",
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                cover: 1,
                                title: 1,
                                privacy: 1,
                                userInfo: 1,
                                likes: 1,
                                timestamp: 1,
                                comments: {
                                    $map: {
                                        input: "$comments",
                                        as: "i",
                                        in: {
                                            $mergeObjects: [
                                                "$$i",
                                                {
                                                    $first: {
                                                        $filter: {
                                                            input: "$commentUserInfo",
                                                            cond: {$eq: ["$$this._id", "$$i.user_id"]}
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                            }
                        },
                        {
                            $unwind: "$userInfo"
                        },
                        { $project : {"userInfo.password" : 0, "likes.password" : 0, "comments.username" : 0,
                                "comments.password" : 0, "comments.bio" : 0, "comments._id" : 0 } },
                        {$sort: {timestamp: 1}}
                    ]).toArray();
                    return data;
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                console.log(e)
                throw e
            }
        },
        book: async (parent, args, context, info) => {
            try {
                // if (context?.user?.loggedIn) {
                if (true) {
                    let data = await db.getCollection(BOOK).aggregate([
                        { $match: {_id: Types.ObjectId(args?.book_id)}},
                        { $lookup: {
                                "from": USER,
                                localField: "members.user_id",
                                foreignField: "_id",
                                as: "userInfo",
                            }},
                        { $lookup: {
                                "from": USER,
                                localField: "timeLine.createdByUser_id",
                                foreignField: "_id",
                                as: "timeLineUserInfo",
                            }},
                        { $lookup: {
                                "from": USER,
                                localField: "timeLine.likes.user_id",
                                foreignField: "_id",
                                as: "timeLineLikes",
                            }
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "timeLine.comments.user_id",
                                foreignField: "_id",
                                as: "timeLineComments",
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                cover: 1,
                                title: 1,
                                privacy: 1,
                                timeLineLikes: 1,
                                timeLineComments: 1,
                                members: {
                                    $map: {
                                        input: "$members",
                                        as: "i",
                                        in: {
                                            $mergeObjects: [
                                                "$$i",
                                                {
                                                    $first: {
                                                        $filter: {
                                                            input: "$userInfo",
                                                            cond: {$eq: ["$$this._id", "$$i.user_id"]}
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                                timeLine: {
                                    $map: {
                                        input: "$timeLine",
                                        as: "i",
                                        in: {
                                            $mergeObjects: [
                                                "$$i",
                                                {
                                                    createdBy:{
                                                        $first: {
                                                            $filter: {
                                                                input: "$timeLineUserInfo",
                                                                cond: {$eq: ["$$this._id", "$$i.createdByUser_id"]}
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                cover: 1,
                                title: 1,
                                privacy: 1,
                                members: 1,
                                timeLineComments: 1,
                                timeLine: {
                                    $map: {
                                        input: "$timeLine",
                                        as: "i",
                                        in: {
                                            $mergeObjects: [
                                                "$$i",
                                                {
                                                    likes: {
                                                        $map: {
                                                            input: "$$i.likes",
                                                            as: "x",
                                                            in: {
                                                                $first: {
                                                                    $filter: {
                                                                        input: "$timeLineLikes",
                                                                        cond: {$eq: ["$$this._id", "$$x.user_id"]}
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                cover: 1,
                                title: 1,
                                privacy: 1,
                                members: 1,
                                timeLine: {
                                    $map: {
                                        input: "$timeLine",
                                        as: "i",
                                        in: {
                                            $mergeObjects: [
                                                "$$i",
                                                {
                                                    comments: {
                                                        $map: {
                                                            input: "$$i.comments",
                                                            as: "x",
                                                            in: {
                                                                $mergeObjects: [
                                                                    "$$x",
                                                                    {
                                                                        $first: {
                                                                            $filter: {
                                                                                input: "$timeLineComments",
                                                                                cond: {$eq: ["$$this._id", "$$x.user_id"]}
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                            }
                        },
                        { $project : {
                            "members.password" : 0,
                            "members.user_id" : 0,
                            "timeLine.createdByUser_id" : 0,
                            "timeLine.createdBy.password" : 0,
                            "timeLine.createdBy.bio" : 0,
                            "timeLine.createdBy.username" : 0,
                            "timeLine.createdBy.location" : 0,
                            "timeLine.likes.password" : 0,
                            "timeLine.likes.bio" : 0,
                            "timeLine.likes.location" : 0,
                            "timeLine.comments.location" : 0,
                            "timeLine.comments.bio" : 0,
                            "timeLine.comments._id" : 0,
                            "timeLine.comments.password" : 0,
                        } },
                    ]).toArray();
                    data[0]['canEdit'] = data[0].members.some((x) => x._id.toString() === context?.user?._id.toString())
                    return data[0]

                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                console.log(e)
                throw e
            }
        },
        getSharedBooks : async (parent, args, context, info) => {
            try {
                // if (context?.user?.loggedIn) {
                if (true) {
                    let data = await db.getCollection(BOOK).aggregate([
                        { $match: { $and: [{user_id: { $ne: Types.ObjectId(context?.user?._id)}},
                                    {"members.user_id": Types.ObjectId(context?.user?._id)}] }},
                        { $lookup: {
                                "from": USER,
                                localField: "user_id",
                                foreignField: "_id",
                                as: "userInfo",
                            }
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "likes.user_id",
                                foreignField: "_id",
                                as: "likes",
                            }
                        },
                        { $lookup: {
                                "from": USER,
                                localField: "comments.user_id",
                                foreignField: "_id",
                                as: "commentUserInfo",
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                cover: 1,
                                title: 1,
                                privacy: 1,
                                userInfo: 1,
                                likes: 1,
                                timestamp: 1,
                                comments: {
                                    $map: {
                                        input: "$comments",
                                        as: "i",
                                        in: {
                                            $mergeObjects: [
                                                "$$i",
                                                {
                                                    $first: {
                                                        $filter: {
                                                            input: "$commentUserInfo",
                                                            cond: {$eq: ["$$this._id", "$$i.user_id"]}
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                            }
                        },
                        {
                            $unwind: "$userInfo"
                        },
                        { $project : {"userInfo.password" : 0, "likes.password" : 0, "comments.username" : 0,
                                "comments.password" : 0, "comments.bio" : 0, "comments._id" : 0 } },
                        {$sort: {timestamp: 1}}
                    ]).toArray();
                    return data;
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
        addPlatformCovers: async (parent, args, context, info) => {
            try {
                if(true){

                    let cover = args.cover

                    if(cover?.imageBackground?.imageSource){
                        cover.imageBackground.imageSource = await uploadImageToCloudinary(cover?.imageBackground?.imageSource, 'Platform_CoverBackground')
                    }
                    if(cover?.image?.imageSource){
                        cover.image.imageSource = await uploadImageToCloudinary(cover?.image?.imageSource, 'Platform_CoverImage')
                    }

                    console.log("saving in mongo ")

                    const added =  (await db.getCollection(PLATFORM_COVERS).insertOne(args.cover)).ops[0]
                    if(added._id){
                        return {status: true, message: 'Cover Added Successfully'}
                    }else{
                        return {status: false, message: 'Failed to add cover'}
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        addBookCover: async (parent, args, context, info) => {
            try {
                if(true){
                    let cover = args.cover

                    if(cover?.imageBackground?.imageSource){
                        if(cover?.imageBackground?.imageSource.indexOf('http') === -1){
                            cover.imageBackground.imageSource = await uploadImageToCloudinary(cover?.imageBackground?.imageSource, 'Platform_CoverBackground')
                        }else{
                            console.log('node uploaded')
                        }
                    }
                    if(cover?.image?.imageSource){
                        if(cover?.image?.imageSource.indexOf('http') === -1){
                            cover.image.imageSource = await uploadImageToCloudinary(cover?.image?.imageSource, 'Platform_CoverImage')
                        }else{
                            console.log('node uploaded')
                        }
                    }

                    const book = {
                        user_id: context?.user?._id,
                        cover
                    }

                    const added =  (await db.getCollection(BOOK).insertOne(book)).ops[0]
                    if(added._id){
                        return {status: true, message: 'Cover Added Successfully', id: added?._id}
                    }else{
                        return {status: false, message: 'Failed to add cover', id: null}
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }


            } catch (e) {
                throw e
            }
        },
        addBook: async (parent, args, context, info) => {
            try {
                if(true){
                    let coverUrl = '';

                    if(args.book.cover){
                        coverUrl = await uploadImageToCloudinary(args.book.cover, 'Book_Cover')
                    }

                    const book = {
                        user_id: Types.ObjectId(context?.user?._id),
                        cover: coverUrl,
                        title: args.book.title,
                        privacy: args.book.privacy,
                        timestamp: Date.now(),
                        members: [{
                            user_id: Types.ObjectId(context?.user?._id),
                            role: 'admin'
                        }],
                        timeLine: [],
                        likes: [],
                        comments: [],
                    }

                    const added =  (await db.getCollection(BOOK).insertOne(book)).ops[0]
                    if(added._id){
                        return {status: true, message: 'Book Added Successfully', id: added?._id}
                    }else{
                        return {status: false, message: 'Failed to add book', id: null}
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        deleteBook: async (parent, args, context, info) => {
            try {
                if(true){
                    let tempBook = await db.getCollection(BOOK).findOne(
                        {
                            "_id": Types.ObjectId(args?.book_id),
                        });

                    if(!tempBook){
                        return {
                            status: false,
                            message: 'No book exists for given id',
                        }
                    }else{
                        await deleteImageFromCloudinary(getImagePublicId(tempBook.cover));
                        if(tempBook.timeLine && tempBook.timeLine.length > 0) {
                            tempBook.timeLine.map((item, index) => {
                                if (item.image.length > 0) {
                                    item.image?.map(async (item) => {
                                        await deleteImageFromCloudinary(getImagePublicId(item.url).toString());
                                    });
                                }
                            })
                        }

                        const deleted = await db.getCollection(BOOK).deleteOne({
                            _id: Types.ObjectId(args.book_id.toString())
                        })

                        if(deleted?.result?.n === 1){
                            return {
                                status: true,
                                message: 'Book deleted successfully!',
                            }
                        }else if(deleted?.result?.n === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in Book',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error deleting Book',
                            }
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        updateBook: async (parent, args, context, info) => {
            try {
                if(true){
                    let tempBook = await db.getCollection(BOOK).findOne(
                        {
                            "_id": Types.ObjectId(args?.book_id),
                        });

                    if(!tempBook){
                        return {
                            status: false,
                            message: 'No book exists for given id',
                        }
                    }else {
                        let bookObj = {};

                        if (args?.cover) {
                            await deleteImageFromCloudinary(getImagePublicId(tempBook?.cover).toString());
                            bookObj['cover'] = coverUrl = await uploadImageToCloudinary(args.cover, 'Book_Cover')
                        }
                        if(args?.title) {
                            if (tempBook?.title !== args.title){
                                bookObj['title'] = args.title;
                            }
                        }
                        if(args?.privacy) {
                            if (tempBook?.privacy !== args?.privacy){
                                bookObj['privacy'] = args?.privacy;
                            }
                        }
                        const query = { _id: Types.ObjectId(args?.book_id) }
                        const update = {
                            $set: {...bookObj}
                        }
                        const added = await db.getCollection(BOOK).updateOne(query, update);
                        if(added?.result?.nModified === 1){
                            return {
                                status: true,
                                message: 'Book updated successfully',
                                cover: bookObj.cover? bookObj.cover : '',
                            }
                        }else if(added?.result?.nModified === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in Book',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error updating Book',
                            }
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        addTimeLinePost: async (parent, args, context, info) => {
            try {
                if(true){
                    let timeLine = args.timeLine
                    const imageURLs = [];
                    let promises = [];

                    if(timeLine?.image?.length > 0) {
                        timeLine.image.map(async item => {
                            promises.push(uploadMultipleImages(item, 'timeline_image'))
                        })
                    }
                    await Promise.all(promises).then(console.log)
                    await promises.map(item => {
                        item.then(image => {
                            imageURLs.push({url: image.url, id: Types.ObjectId()})
                        })
                    })

                    let id =  Types.ObjectId()
                    let timeLineData = {
                        title: timeLine?.title,
                        image: imageURLs,
                        description: timeLine.description,
                        createdByUser_id: Types.ObjectId(context?.user?._id),
                        timestamp: Date.now(),
                        likes: [],
                        comments: [],
                        id
                    }
                    const query = { _id: Types.ObjectId(timeLine?.book_id) }

                    const update = {
                        "$push": {
                            timeLine: {
                                "$each": [timeLineData], "$sort": {"timestamp": -1}
                            }
                        }
                    }

                    const added = await db.getCollection(BOOK).updateOne(query, update);
                    if(added?.result?.nModified === 1){
                        const user = await db.getCollection('user').findOne({ _id: Types.ObjectId(context?.user?._id)})
                        try {
                            context.pubsub.publish(TIMELINE,
                                {
                                    newTimeLine: {
                                        newTimeLine: {
                                            book_id: timeLine?.book_id,
                                            title: timeLine?.title,
                                            image: imageURLs,
                                            description: timeLine.description,
                                            createdBy: {
                                                _id: user?._id,
                                                name: user?.name,
                                                profileImage: user?.profileImage,
                                            },
                                            timestamp: Date.now(),
                                            id,
                                            likes: [],
                                            comments: []
                                        },
                                        action: NEW_TIMELINE,
                                    }

                                })
                        } catch (e) {
                            throw e
                        }

                        return {
                            status: true,
                            message: 'Timeline Added successfully!',
                            id,
                            image: imageURLs,
                            createdBy: context?.user?._id,
                            timestamp: timeLineData.timestamp
                        }
                    }else if(added?.result?.nModified === 0){
                        return {
                            status: false,
                            message: 'Nothing to change in book',
                        }
                    }else{
                        return {
                            status: false,
                            message: 'Error adding to time line',
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        deleteTimeLinePost: async (parent, args, context, info) => {
            try {
                if(true){
                    const book = await db.getCollection(BOOK).find(
                        { 'timeLine.id': Types.ObjectId(args.id)},
                        {timeLine: {$slice: -1} }
                    )

                    let tempBook;
                    await book.toArray().then(res => {
                       tempBook = res[0]
                    });

                    if(!tempBook){
                            return {
                                status: false,
                                message: 'No timeline exists for given id',
                            }
                    }else{
                        const deletedImage = tempBook?.timeLine?.find(x => x.id.toString() === args?.id.toString()).image;
                        if(deletedImage.length > 0) {
                            deletedImage?.map(async (item) => {
                                // console.log(getImagePublicId(item.url));
                                await deleteImageFromCloudinary(getImagePublicId(item.url));
                            });
                        }

                        const query = { _id: Types.ObjectId(tempBook?._id.toString()) }
                        const deleteQuery = { $pull: { timeLine: { id: Types.ObjectId(args?.id.toString()) } } }

                        const deleted = await  db.getCollection(BOOK).update(
                            query,
                            deleteQuery,
                        )
                        if(deleted?.result?.nModified === 1){
                            context.pubsub.publish(TIMELINE, {
                                newTimeLine: {
                                    newTimeLine: {
                                        book_id: tempBook?._id.toString(),
                                        id: args.id,
                                    },
                                    action: DELETE_TIMELINE,
                                },
                            })
                            return {
                                status: true,
                                message: 'Timeline deleted successfully!',
                            }
                        }else if(deleted?.result?.nModified === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error deleting to time line',
                            }
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        updateTimeLinePost: async (parent, args, context, info) => {
            try {
                if(true){
                    const book = await db.getCollection(BOOK).find(
                        { 'timeLine.id': Types.ObjectId(args.timeLine.timeLineId)},
                        {timeLine: {$slice: -1} }
                    )

                    let tempBook;
                    await book.toArray().then(res => {
                        tempBook = res[0]
                    });

                    if(!tempBook){
                        return {
                            status: false,
                            message: 'No timeline exists for given id',
                        }
                    }else{
                        const oldImages = tempBook?.timeLine?.find(x => x.id.toString() === args?.timeLine?.timeLineId.toString()).image;
                        let newImages = [];
                        if (args?.timeLine?.deletedImages?.length > 0) {
                            oldImages?.map(async (item) => {
                                if (args.timeLine.deletedImages.some(x => item.url === x)) {
                                    await deleteImageFromCloudinary(getImagePublicId(item.url));
                                } else {
                                    newImages.push(item);
                                }
                            });
                        } else {
                            newImages = oldImages
                        }
                        if (args?.timeLine?.image?.length > 0){
                            let promises = [];
                            args.timeLine.image.map(async item => {
                                promises.push(uploadMultipleImages(item, 'timeline_image'))
                            })
                            await Promise.all(promises).then(console.log)
                            await promises.map(item => {
                                item.then(image => {
                                    newImages.push({url: image.url, id: Types.ObjectId()})
                                })
                            })
                        }
                        let setQuesry = {};
                        if(args?.timeLine?.title){
                            setQuesry["timeLine.$.title"] = args.timeLine.title
                        }
                        if(args?.timeLine?.description){
                            setQuesry["timeLine.$.description"] = args.timeLine.description
                        }
                        setQuesry["timeLine.$.image"] = newImages
                        // if(newImages.length > 0){
                        //     setQuesry["timeLine.$.image"] = newImages
                        // }

                        const query = { 'timeLine.id': Types.ObjectId(args.timeLine.timeLineId)}
                        const updateQuery = {
                            $set: setQuesry
                        }

                        const updated = await  db.getCollection(BOOK).update(
                            query,
                            updateQuery,
                        )
                        if(updated?.result?.nModified === 1){

                            context.pubsub.publish(TIMELINE, {
                                newTimeLine: {
                                    newTimeLine: {
                                        book_id: tempBook?._id?.toString(),
                                        title: args?.timeLine?.title,
                                        image: newImages,
                                        description: args?.timeLine.description,
                                        id: args?.timeLine?.timeLineId,
                                    },
                                    action: UPDATE_TIMELINE,
                                },
                            })


                            return {
                                status: true,
                                message: 'Timeline updated successfully!',
                                image : newImages
                            }
                        }else if(updated?.result?.nModified === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error updating to timeLine',
                            }
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        findBookUser: async (parent, args, context, info) => {
            let data = await db.getCollection(USER).aggregate([
                { $match: { $or: [{ username: args.user.username },
                            // {name: /.* .*/},
                            { name: { "$regex": args.user.username.toString() , "$options": "i" }}] }},
                { $lookup: {
                        "from": REQUEST,
                        "let": { "id": "$_id" },
                        "pipeline": [
                            { "$match": {
                                    "$expr":{"$eq":["$$id","$invitedToUser_id"]},
                                    "book_id": Types.ObjectId(args.user.book_id.toString())
                                }}
                        ],
                        as: "isRequested",
                    }},
                { $lookup: {
                        "from": BOOK,
                        "let": { "id": "$_id" },
                        "pipeline": [
                            {"$match": {"_id": Types.ObjectId(args.user.book_id.toString())}},
                            {"$match":{"$expr":{"$in":["$$id","$members.user_id"]}}},
                            // {"$match":{"$expr":{"$eq":["$members.user_id", "$$id"]}}},
                        ],
                        as: "isMember",
                    }},
                {
                    $project: {
                        isRequested: 1,
                        profileImage: 1,
                        name: 1,
                        username: 1,
                        isMember: {
                            $map: {
                                input: "$isMember",
                                as: "i",
                                in: {
                                        $filter: {
                                        input: "$$i.members",
                                        cond: {$eq: ["$$this.user_id", "$_id"]}
                                    }
                                }
                            }
                        }
                    }
                },
            ]).toArray();
            data.map(item => {
                if (item.isMember.length > 0 || item.isRequested.length > 0){
                    if (item.isRequested.length > 0){
                        item.isMember = null;
                        item.isRequested = item.isRequested[0]._id
                        return true;
                    } else {
                        item.isMember = item.isMember[0][0].role;
                        item.isRequested = null
                        return true;
                    }
                } else {
                    item.isMember = null
                    item.isRequested = null
                    return true;
                }
            })

            if (true) {
                return {
                    status: true,
                    message: 'Users Found.',
                    users : data
                }
            }else{
                return {
                    status: false,
                    message: 'No user found'
                }
            }
        },
        deleteUserFromBook: async (parent, args, context, info) => {
            try {
                if(true){
                    const book = await db.getCollection(BOOK).find(
                        { 'members.user_id': Types.ObjectId(args.user_id), _id: Types.ObjectId(args.book_id)},
                        {members: {$slice: -1} }
                    )

                    let tempBook;
                    await book.toArray().then(res => {
                        tempBook = res[0]
                    });

                    if(!tempBook){
                        return {
                            status: false,
                            message: 'Member not exists for given Book',
                        }
                    }else{

                        const query = { _id: Types.ObjectId(args.book_id.toString()) }
                        const deleteQuery = { $pull: { members: { user_id: Types.ObjectId(args?.user_id.toString()) } } }

                        const deleted = await  db.getCollection(BOOK).update(
                            query,
                            deleteQuery,
                        )
                        if(deleted?.result?.nModified === 1){
                            return {
                                status: true,
                                message: 'Member deleted successfully!',
                            }
                        }else if(deleted?.result?.nModified === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error deleting member',
                            }
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        addLikeToBook: async (parent, args, context, info) => {
            try {
                if(true){
                    let data = await db.getCollection(BOOK).findOne(
                        {"likes.user_id": Types.ObjectId(context?.user?._id),
                            _id: Types.ObjectId(args?.book_id)});
                    if(!data) {
                        let likeData = {
                            user_id: Types.ObjectId(context?.user?._id),
                        }
                        const query = {_id: Types.ObjectId(args.book_id)}
                        const update = {
                            $addToSet: {
                                likes: {...likeData}
                            }
                        }
                        const added = await db.getCollection(BOOK).updateOne(query, update);
                        if (added?.result?.nModified === 1) {
                            return {
                                status: true,
                                message: 'Like Added successfully!',
                            }
                        } else if (added?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error adding Like to book',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Like is already added to book',
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        deleteLikeFromBook: async (parent, args, context, info) => {
            try {
                if (true) {
                    let data = await db.getCollection(BOOK).findOne(
                        {
                            "likes.user_id": Types.ObjectId(context?.user?._id),
                            _id: Types.ObjectId(args?.book_id)
                        });
                    if (data) {
                        const query = {_id: Types.ObjectId(args?.book_id.toString())}
                        const deleteQuery = {$pull: {likes: {user_id: Types.ObjectId(context?.user?._id)}}}
                        const deleted = await db.getCollection(BOOK).update(
                            query,
                            deleteQuery,
                        )
                        if (deleted?.result?.nModified === 1) {
                            return {
                                status: true,
                                message: 'Like deleted successfully!',
                            }
                        } else if (deleted?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error deleting Like from book',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Like not found in this book',
                        }
                    }
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        addCommentToBook: async (parent, args, context, info) => {
            try {
                if(true){
                    let data = await db.getCollection(BOOK).findOne(
                        {_id: Types.ObjectId(args?.book_id)});
                    if(data) {
                        let commentData = {
                            id:  Types.ObjectId(),
                            user_id: Types.ObjectId(context?.user?._id),
                            comment: args?.comment,
                            timestamp: Date.now(),
                        }
                        const query = {_id: Types.ObjectId(args?.book_id)}

                        const update = {
                            "$push": {
                                comments: {
                                    "$each": [commentData], "$sort": {"timestamp": -1}
                                }
                            }
                        }
                        const added = await db.getCollection(BOOK).updateOne(query, update);
                        if (added?.result?.nModified === 1) {
                            return {
                                status: true,
                                message: 'Comment Added successfully!',
                                id: commentData.id,
                                timestamp: commentData.timestamp,
                            }
                        } else if (added?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error adding Comment to book',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Book not found',
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        deleteCommentFromBook: async (parent, args, context, info) => {
            try {
                if (true) {
                    let data = await db.getCollection(BOOK).findOne(
                        {
                            "comments.id": Types.ObjectId(args?.comment_id),
                        });
                    if (data) {
                        const query = {_id: Types.ObjectId(args?.book_id.toString())}
                        const deleteQuery = {$pull: {comments: {id: Types.ObjectId(args?.comment_id)}}}
                        const deleted = await db.getCollection(BOOK).update(
                            query,
                            deleteQuery,
                        )
                        if (deleted?.result?.nModified === 1) {
                            return {
                                status: true,
                                message: 'Comment deleted successfully!',
                            }
                        } else if (deleted?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error deleting comment from book',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Comment not found in this book',
                        }
                    }
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        updateCommentOnBook: async (parent, args, context, info) => {
            try {
                if (true) {
                    let data = await db.getCollection(BOOK).findOne(
                        {
                            "comments.id": Types.ObjectId(args?.comment_id),
                        });
                    if (data) {
                        let commentData = {
                            "comments.$.comment": args?.comment,
                        }
                        const query = { 'comments.id': Types.ObjectId(args?.comment_id)}
                        const updateQuery = {
                            $set: commentData
                        }

                        const updated = await  db.getCollection(BOOK).update(
                            query,
                            updateQuery,
                        )
                        if(updated?.result?.nModified === 1){
                            return {
                                status: true,
                                message: 'Comment updated successfully!',
                            }
                        }else if(updated?.result?.nModified === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error updating to Comment',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Comment not found in this book',
                        }
                    }
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        addLikeToTimeLine: async (parent, args, context, info) => {
            try {
                if(true){
                    let data = await db.getCollection(BOOK).findOne(
                        {timeLine: {
                            $elemMatch:{
                                "id" : Types.ObjectId(args.timeLine_id.toString()),
                                "likes.user_id":Types.ObjectId(context?.user?._id)}}}
                        );
                    const book = await db.getCollection(BOOK).find(
                        { 'timeLine.id': Types.ObjectId(args.timeLine_id.toString())},
                        {timeLine: {$slice: -1} }
                    )

                    let tempBook;
                    await book.toArray().then(res => {
                        tempBook = res[0]
                    });
                    if(!data) {
                        let likeData = {
                            user_id: Types.ObjectId(context?.user?._id),
                        }
                        const query = {'timeLine.id': Types.ObjectId(args.timeLine_id)}
                        const update = {
                            $addToSet: {
                                'timeLine.$.likes': {...likeData}
                            }
                        }
                        const added = await db.getCollection(BOOK).updateOne(query, update);
                        if (added?.result?.nModified === 1) {
                            const user = await db.getCollection('user').findOne({ _id: Types.ObjectId(context?.user?._id)})
                            context.pubsub.publish(TIMELINE, {
                                newTimeLine: {
                                    newTimeLine: {
                                        book_id: tempBook?._id?.toString(),
                                        id: args?.timeLine_id,
                                        likes: [{
                                            _id: user?._id,
                                            name: user?.name,
                                            username: user?.username,
                                            profileImage: user?.profileImage,
                                        }],
                                        comments: []
                                    },
                                action: ADD_TIMELINE_LIKE,
                            }})
                            // add user-log and push log in subscriber
                            let index = tempBook.timeLine.findIndex(
                                (i) => i.id.toString() === args?.timeLine_id.toString(),
                            );
                            if (tempBook.timeLine[index].createdByUser_id.toString() !== user?._id.toString()) {
                                const query = {
                                    fromUser_id: Types.ObjectId(user?._id),
                                    toUser_id: Types.ObjectId(tempBook.timeLine[index].createdByUser_id),
                                    book_id: Types.ObjectId(tempBook?._id),
                                    action: TIMELINE_LIKE,
                                    timeLine_id: Types.ObjectId(args?.timeLine_id)
                                }

                                const update = {
                                    "$set": {
                                        fromUser_id: Types.ObjectId(user?._id),
                                        toUser_id: Types.ObjectId(tempBook.timeLine[index].createdByUser_id),
                                        book_id: Types.ObjectId(tempBook?._id),
                                        action: TIMELINE_LIKE,
                                        timeLine_id: Types.ObjectId(args?.timeLine_id),
                                        timestamp: Date.now(),
                                    },
                                }
                                await db.getCollection(USER_LOGS).updateOne(query, update, {upsert: true})
                                let user_id = tempBook.members.some((x) => {
                                    x.user_id.toString() === tempBook.timeLine[index].createdByUser_id.toString()
                                })
                                context.pubsub.publish(USER_LOG, {
                                    newUserLog: {
                                        user_id: user_id ? tempBook?.timeLine[index]?.createdByUser_id : tempBook?.user_id,
                                        status: true,
                                        message: 'TimeLine Like ',
                                        timestamp: Date.now(),
                                    }
                                })
                            }
                            return {
                                status: true,
                                message: 'Like Added successfully!',
                            }
                        } else if (added?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in timeline',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error adding Like to Timeline',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Like is already added to timeline',
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        deleteLikeFromTimeLine: async (parent, args, context, info) => {
            try {
                if (true) {
                    let data = await db.getCollection(BOOK).findOne(
                        {"timeLine.likes.user_id": Types.ObjectId(context?.user?._id),
                            'timeLine.id': Types.ObjectId(args.timeLine_id)})
                    if (data) {
                        const query = {'timeLine.id': Types.ObjectId(args.timeLine_id)}
                        const deleteQuery = {$pull: {'timeLine.$.likes': {user_id: Types.ObjectId(context?.user?._id)}}}
                        const deleted = await db.getCollection(BOOK).update(
                            query,
                            deleteQuery,
                        )
                        if (deleted?.result?.nModified === 1) {
                            context.pubsub.publish(TIMELINE, {
                                newTimeLine: {
                                    newTimeLine: {
                                        book_id: data?._id?.toString(),
                                        id: args?.timeLine_id,
                                        likes: [{
                                            _id: context?.user?._id,
                                        }],
                                    },
                                    action: DELETE_TIMELINE_LIKE,
                                }})
                            return {
                                status: true,
                                message: 'Like deleted successfully!',
                            }
                        } else if (deleted?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in timeLine',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error deleting Like from timeLine',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Like not found in this Timeline',
                        }
                    }
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        addCommentToTimeLine: async (parent, args, context, info) => {
            try {
                if(true){
                    let data = await db.getCollection(BOOK).findOne(
                        {'timeLine.id': Types.ObjectId(args?.timeLine_id)});
                    if(data) {
                        let commentData = {
                            id:  Types.ObjectId(),
                            user_id: Types.ObjectId(context?.user?._id),
                            comment: args?.comment,
                            timestamp: Date.now(),
                        }
                        const query = {'timeLine.id': Types.ObjectId(args?.timeLine_id)}
                        const update = {
                            "$push": {
                                'timeLine.$.comments': {
                                    "$each": [commentData], "$sort": {"timestamp": -1}
                                }
                            }
                        }
                        const added = await db.getCollection(BOOK).updateOne(query, update);
                        if (added?.result?.nModified === 1) {
                            const user = await db.getCollection('user').findOne({ _id: Types.ObjectId(context?.user?._id)})
                            context.pubsub.publish(TIMELINE, {
                                newTimeLine: {
                                    newTimeLine: {
                                        book_id: data?._id?.toString(),
                                        id: args?.timeLine_id,
                                        comments: [{
                                            user_id: user?._id,
                                            id: commentData.id,
                                            name: user?.name,
                                            profileImage: user?.profileImage,
                                            comment: args?.comment,
                                            timestamp: commentData.timestamp
                                        }]
                                    },
                                    action: ADD_TIMELINE_COMMENT,
                                }})
                            return {
                                status: true,
                                message: 'Comment Added successfully!',
                                id: commentData.id,
                                timestamp: commentData.timestamp,
                            }
                        } else if (added?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in timeline',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error adding comment to Timeline',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'TimeLine not found',
                        }
                    }
                }else{
                    throw new AuthenticationError("Please login to get data")
                }

            } catch (e) {
                throw e
            }
        },
        deleteCommentFromTimeLine: async (parent, args, context, info) => {
            try {
                if (true) {
                    let data = await db.getCollection(BOOK).findOne(
                        {
                            "timeLine.comments.id": Types.ObjectId(args?.comment_id),
                        },{timeLine: {$slice: -1} });
                    if (data) {
                        const query = {"timeLine.comments.id": Types.ObjectId(args?.comment_id.toString())}
                        const deleteQuery = {$pull: {"timeLine.$.comments": {id: Types.ObjectId(args?.comment_id)}}}
                        const deleted = await db.getCollection(BOOK).update(
                            query,
                            deleteQuery,
                        )
                        if (deleted?.result?.nModified === 1) {
                            context.pubsub.publish(TIMELINE, {
                                newTimeLine: {
                                    newTimeLine: {
                                        book_id: data?._id?.toString(),
                                        comments: [{
                                            id: args?.comment_id,
                                        }],
                                    },
                                    action: DELETE_TIMELINE_COMMENT,
                                }})
                            return {
                                status: true,
                                message: 'Comment deleted successfully!',
                            }
                        } else if (deleted?.result?.nModified === 0) {
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        } else {
                            return {
                                status: false,
                                message: 'Error deleting comment from book',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Comment not found in this book',
                        }
                    }
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
        updateCommentOnTimeline: async (parent, args, context, info) => {
            try {
                if (true) {
                    let data = await db.getCollection(BOOK).findOne(
                        {
                            "timeLine.comments.id": Types.ObjectId(args?.comment_id),
                        });
                    if (data) {
                        const commentData = {
                            "timeLine.$[i].comments.$[j].comment": args?.comment,
                        }

                        const arrayFilters = {
                            arrayFilters: [
                                {"i.id":Types.ObjectId(args?.timeLine_id.toString())},
                                {"j.id":Types.ObjectId(args?.comment_id.toString())}
                            ]
                        };
                        const query = {"timeLine.comments.id": Types.ObjectId(args?.comment_id.toString())}
                        const updateQuery = {
                            $set: commentData
                        }

                        const updated = await  db.getCollection(BOOK).update(
                            query,
                            updateQuery,
                            arrayFilters,
                        )
                        if(updated?.result?.nModified === 1){
                            context.pubsub.publish(TIMELINE, {
                                newTimeLine: {
                                    newTimeLine: {
                                        book_id: data?._id?.toString(),
                                        id: args?.timeLine_id,
                                        comments: [{
                                            id: args?.comment_id,
                                            comment: args?.comment
                                        }],
                                    },
                                    action: UPDATE_TIMELINE_COMMENT,
                                }})
                            return {
                                status: true,
                                message: 'Comment updated successfully!',
                            }
                        }else if(updated?.result?.nModified === 0){
                            return {
                                status: false,
                                message: 'Nothing to change in book',
                            }
                        }else{
                            return {
                                status: false,
                                message: 'Error updating to Comment',
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: 'Comment not found in this book',
                        }
                    }
                } else {
                    throw new AuthenticationError("Please login to get data")
                }
            } catch (e) {
                throw e
            }
        },
    }
};

module.exports = {
    bookResolvers,
}
