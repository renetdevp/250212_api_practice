const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');

/**
 * Create post(postId) with post, userAuth
 * 
 * @param {Object} post 
 * @param {String} userAuth
 * @returns {Array} [code: Number, msg: String]
 */
function createOne(post, userAuth){
    return new Promise((resolve, reject) => {
        if (!isValidPostFormat(post)){
            return reject([400, 'Invalid Post format']);
        }

        if (!isValidUserAuth(userAuth)){
            return reject([400, 'Invalid User Identification']);
        }

        const jwtSecret = process.env.jwtSecret || 'thisissecret';
        const jwtOption = {
            algorithms: 'HS512'
        };

        jwt.verify(userAuth, jwtSecret, jwtOption, (err, decoded) => {
            if (err){
                return reject(getJWTErrorCode(err));
            }

            const createPromise = Post.create({
                ...post,
                author: decoded.userId
            });

            createPromise.then((doc) => {
                resolve([201, `User ${doc.title} created`]);
            })
            .catch((err) => {
                reject[500, err];
            });
        });
    });
}

/**
 * Read post(postId) with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Array} [code: Number, msg: String, user: Object]
 */
function readOne(filter = {}, projection = {}){
    return new Promise((resolve, reject) => {
        if (!isValidObjectId(filter?.postId)){
            return reject(400, 'Invalid postId');
        }

        const findOnePromise = Post.findOne(filter, projection).exec();

        findOnePromise.then((post) => {
            if (isEmptyPost(post)){
                return reject([404, `Post ${ filter._id } not found`]);
            }

            resolve([200, null, post]);
        })
        .catch((err) => {
            reject([500, err, null]);
        });
    });
}

/**
 * Read all post with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Array} [code: Number, msg: String, posts: Array]
 */
function readAll(filter = {}, projection = { _id: 0, title: 1, content: 1, author: 1 }){
    return new Promise((resolve, reject) => {
        const findPromise = Post.find(filter, projection).exec();

        findPromise.then((posts) => {
            resolve([200, null, posts]);
        })
        .catch((err) => {
            reject([500, err, null]);
        });
    });
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

function isValidPostFormat(post){
    if (!post){
        return false;
    }
    if (typeof post.title !== 'string'){
        return false;
    }
    if (typeof post.content !== 'string'){
        return false;
    }

    return true;
}

function isValidUserAuth(userAuth){
    if (!userAuth){
        return false;
    }
    if (typeof userAuth !== 'string'){
        return false;
    }

    return true;
}

function getJWTErrorCode(err){
    if (err?.name === 'TokenExpiredError'){
        return [400, 'JWT expired'];
    }

    if (err?.name === 'JsonWebTokenError'){
        return [400, 'Invalid JWT'];
    }

    return [500, 'Error while verify JWT'];
}

function isEmptyPost(post){
    if (!post || (Object.keys(post).length === 0)) return true;

    return false;
}

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
};