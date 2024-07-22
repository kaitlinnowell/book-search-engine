const { signToken, AuthenticationError } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id });
            }
            throw AuthenticationError;
          },
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
          },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw AuthenticationError;
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw AuthenticationError;
            }
      
            const token = signToken(user);
      
            return { token, user };
          },
        saveBook: async (parent, {bookInput}, context) => {
            if (context.user) {
                try {
                    const userUpdated = await User.findByIdAndUpdate(
                        { _id: context.user._id },
                        { $push: { savedBooks: bookInput } },
                        { new: true }
                    );
                    return userUpdated;
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to save book');
                }
            }
            throw AuthenticationError;
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                try {
                    const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                    )
                    return updatedUser;
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to save book');
                }
            }
            throw AuthenticationError;
        }
    }
}

module.exports = resolvers;