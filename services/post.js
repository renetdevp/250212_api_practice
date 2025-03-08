const Post = require('../models/post');
const { verify } = require('./jwt');
const { isValidObjectId } = require('mongoose');

/**
 * Create post(postId) with post, userAuth
 * 
 * @param {Object} post 
 * @param {String} userAuth
 * @returns {Array} [code: Number, msg: String]
 */
function createOne(post, userAuth){
    return new Promise(async (resolve, reject) => {
        if (!isValidPostFormat(post)){
            return reject([400, 'Invalid Post format']);
        }

        if (!isValidUserAuth(userAuth)){
            return reject([400, 'Invalid User Identification']);
        }

        verify(userAuth)
        .then((result) => {
            const [code, decodedUserId] = result;

            return Post.create({
                ...post,
                author: decodedUserId,
            });
        })
        .then((doc) => {
            resolve([201, `Post ${doc.title} created`]);
        })
        .catch((err) => {
            const [code, msg] = err;
            reject([code, msg]);
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
function readOne(filter = {}, projection = { __v: 0 }){
    return new Promise((resolve, reject) => {
        if (!isValidObjectId(filter?._id)){
            return reject([400, 'Invalid postId']);
        }

        // https://mongoosejs.com/docs/api/model.html#Model.findOne()
        // .lean()을 적용하지 않으면 find의 결과물은 document이고, document는 내부에 change track을 위한 내부 상태가 많아 js object보다 크기가 큼
        // 하지만, .lean()을 적용하면 change track, casting and validation, getters and setters, virtuals, save()를 이용할 수 없음
        // 이러한 .lean()은 쿼리의 실행 정보를 가공 없이 바로 response로 보낼 때, 즉 HTTP GET 요청에서 사용하는게 적절함
        // .lean()은 절대로 POST, PUT 메소드에서 이용해선 안됨

        const findOnePromise = Post.findOne(filter, projection).lean().exec();

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
        const findPromise = Post.find(filter, projection).lean().exec();

        findPromise.then((posts) => {
            resolve([200, null, posts]);
        })
        .catch((err) => {
            reject([500, err, null]);
        });
    });
}

function updateOne(postId, post){
    return new Promise((resolve, reject) => {
        if (!isValidObjectId(postId)){
            return reject([400, 'Invalid postId']);
        }

        if (!isValidPostFormat(post)){
            return reject([400, 'Invalid post format']);
        }

        const updateOnePromise = Post.updateOne({ _id: postId }, post).exec();

        updateOnePromise.then((result) => {
            if (result.matchedCount === 0){
                return reject([404, `Post ${postId} not found`]);
            }

            resolve([201, `Post ${postId} updated`]);
        })
        .catch((err) => {
            reject([500, err]);
        });
    });
}

function deleteOne(postId){
    return new Promise((resolve, reject) => {
        if (!isValidObjectId(postId)){
            return reject([400, 'Invalid postId']);
        }

        const deleteOnePromise = Post.deleteOne({ _id: postId }).exec();

        deleteOnePromise.then((result) => {
            if (result.deletedCount === 0){
                return reject([404, `Post ${postId} not found`]);
            }

            resolve([201, `Post ${postId} deleted`]);
        })
        .catch((err) => {
            reject([500, err]);
        });
    });
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

function getJWTErrorCode(errName){
    const errMap = {
        'TokenExpiredError': [400, 'JWT expired'],
        'JsonWebTokenError': [400, 'Invalid JWT'],
    };

    if (!!errMap[errName]){
        return errMap[errName];
    }

    return [500, 'Error while verify JWT'];
}

function isEmptyPost(post){
    if (!post) return true;
    if (Object.keys(post).length === 0) return true;

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