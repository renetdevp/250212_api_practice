const User = require('../models/user');

async function createOne(userId, hash){
    /*
        return code
        0:  user created
        -1: user request is not valid to user schema
        -2: user(id) already exist
        -3: server error    */
    try {
        // User already exist
        const count = await User.countDocuments({ userId: userId });
        if (count > 0) return -2;

        const newUser = new User({ userId, hash });
        const error = newUser.validateSync();
        // User request is not valid to User schema
        if (!!error) return -1;

        await newUser.save();

        return 0;
    } catch (e){
        return -3;
    }
}

async function readOne(filter = {}, projection = { userId: 1, _id: 0 }){
    /*
        return value
        { id }:   user(id) found
        0:      user not found
        -1:     server error
    */
    try {
        const user = await User.findOne(filter, projection).exec();

        //  if user(userId) not exists, then user === null
        if (!user || (Object.keys(user).length === 0)) return 0;
        
        return user;
    } catch (e){
        return -1;
    }
}

async function readAll(filter = {}, projection = { userId: 1, _id: 0 }){
    /*
        return value
        [{user1}, {user2}]: users found
        []:                 users not found
        null:               server error
    */
    try {
        const users = await User.find(filter, projection);

        return users;
    } catch (e){
        return null;
    }
}

async function updateOne(userId, user){
    try {
        const isExist = await User.exists({ userId: userId });

        if ((typeof(user?.userId) !== 'string') || (typeof(user?.hash) !== 'string')){
            return -3;
        }

        if (!!isExist){
            await User.findOneAndUpdate({ userId: userId }, user);

            return 0;
        }else {
            // User not exists
            return -1;
        }
    } catch (e){
        return -2;
    }
}

async function deleteOne(userId){
    try {
        await User.deleteOne({ id: userId });

        return true;
    } catch (e){
        return false;
    }
}

async function deleteAll(){
    try {
        await User.deleteMany({});

        return true;
    } catch (e){
        return false;
    }
}

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
};