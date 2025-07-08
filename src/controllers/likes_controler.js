import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/errorResponse.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {AsyncHandler} from "../utils/Asynchandler.js"

const toggleVideoLike = AsyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    
})

const toggleCommentLike = AsyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = AsyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = AsyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}