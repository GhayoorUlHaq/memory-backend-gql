const db = require('../db');
const Types = require('mongodb');

const {
    AuthenticationError,
} = require('apollo-server');

const FEEDBACK = 'feedback'

const feedbackResolvers = {
    Mutation: {
        addFeedback: async (parent, args, context, info) => {
            try {
                if(true) {
                    const feedback = {
                        user_id: Types.ObjectId(context?.user?._id),
                        email: args.email,
                        message: args.message,
                    }
                    const added = (await db.getCollection(FEEDBACK).insertOne(feedback)).ops[0]
                    if (added._id) {
                        return {status: true, message: 'Feedback added successfully'}
                    } else {
                        return {status: false, message: 'Failed to add feedback'}
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
    feedbackResolvers,
}
