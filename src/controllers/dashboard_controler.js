import mongoose from "mongoose"
import {Video} from "../models/videos.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/errorResponse.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {AsyncHandler} from "../utils/Asynchandler.js"

const getChannelStats = AsyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = AsyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }