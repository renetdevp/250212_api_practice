const Post = require('../models/post');

async function createOne(post, user){
    /*
        return code
        0:  post created
        -1: error while create post
    */
    try {
        await Post.create({
            ...post,
            author: user
        });

        return 0;
    }catch (e){
        return -1;
    }
}

async function readOne(postId){
    /*
        return value
        post:   post(num) found
        null:   post(num) not found
    */
    try {
        const post = await Post.findOne({ _id: postId }, { _id: 0 });

        return post;
    }catch (e){
        return null;
    }
}

async function readAll(){
    try {
        const posts = await Post.find({}, { _id: 0 });

        return posts;        
    }catch (e){
        return null;
    }
}

async function updateOne(postId, post){
    /*
        return code
        0:  post(postId) updated
        -1: post(postId) does not exist
        -2: error while update post(postId)
    */
    try {
        const targetPost = await Post.exists({ _id: postId });

        if (!targetPost) return -1;

        await Post.updateOne({ _id: postId }, post);

        return 0;
    }catch (e){
        return -2;
    }
}

async function deleteOne(postId){
    try {
        await Post.deleteOne({ _id: postId });

        return true;
    }catch (e){
        return false;
    }
}

async function deleteAll(){
    try {
        await Post.deleteMany({});

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