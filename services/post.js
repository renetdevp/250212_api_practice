const { isValidObjectId } = require('mongoose');
const Post = require('../models/post');

/**
 * Create post(postId) with post, userAuth
 * 
 * @param {Object} post 
 * @param {String} userAuth
 * @returns {Object|null}
 */
async function createOne(post, userId){
    if (!isValidPostFormat(post)){
        return createErrorResponse(400, 'Invalid Post Format');
    }

    try {
        await Post.create({
            ...post,
            author: userId,
        });

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * Read post(postId) with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Object} { err: object|null, post: object|null }
 */
async function readOne(filter = {}, projection = { __v: 0 }){
    if (!isValidObjectId(filter?._id)){
        return createErrorResponse(400, 'Invalid postId');
    }

    // https://mongoosejs.com/docs/api/model.html#Model.findOne()
    // .lean()을 적용하지 않으면 find의 결과물은 document이고, document는 내부에 change track을 위한 내부 상태가 많아 js object보다 크기가 큼
    // 하지만, .lean()을 적용하면 change track, casting and validation, getters and setters, virtuals, save()를 이용할 수 없음
    // 이러한 .lean()은 쿼리의 실행 정보를 가공 없이 바로 response로 보낼 때, 즉 HTTP GET 요청에서 사용하는게 적절함
    // .lean()은 절대로 POST, PUT 메소드에서 이용해선 안됨

    try {
        const post = await Post.findOne(filter, projection).lean();

        if (isEmptyPost(post)){
            return createErrorResponse(404, `Post${filter._id} not found`);
        }

        return { err: null, post };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * Read all post with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Object} { err: object|null, posts: object|null }
 */
async function readAll(filter = {}, projection = { __v: 0 }){
    try {
        const posts = await Post.find(filter, projection).lean();

        return { err: null, posts };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * 
 * @param {String} postId 
 * @param {Object} post 
 * @param {String} userAuth
 * @returns {Object|null} { err: object|null }
 */
async function updateOne(postId, post, userId){
    if (!isValidObjectId(postId)){
        return createErrorResponse(400, 'Invalid postId');
    }

    if (!isValidPostFormat(post)){
        return createErrorResponse(400, 'Invalid post format');
    }

    try {
        const foundPost = await Post.findOne({ _id: postId }).lean();

        if (isEmptyPost(foundPost)){
            return createErrorResponse(404, `Post ${postId} not found`);
        }

        if (foundPost.author !== userId){
            return createErrorResponse(403, 'Not authorizated');
        }

        await Post.updateOne({ _id: postId }, post);

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

async function deleteOne(postId, userId){
    if (!isValidObjectId(postId)){
        return createErrorResponse(400, 'Invalid postId');
    }

    try {
        const foundPost = await Post.findOne({ _id: postId }).lean();

        if (isEmptyPost(foundPost)){
            return createErrorResponse(404, `Post ${postId} not found`);
        }

        if (foundPost.author !== userId){
            return createErrorResponse(403, 'Not authorizated');
        }

        await Post.deleteOne({ _id: postId });

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

async function deleteAll(){
    try {
        await Post.deleteMany({});

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
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

function isEmptyPost(post){
    if (!post) return true;
    if (Object.keys(post).length === 0) return true;

    return false;
}

function createErrorResponse(code, msg, details=undefined){
    return {
        err: {
            code,
            msg,
            details,
        },
    };
}

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
};