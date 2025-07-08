import mongoose from "mongoose";
import { ApiResponse } from "../utils/apiResponse";
import { Apierror } from "../utils/apierror";
import { Asynchandler } from "../utils/asyncHandler";
import { Comment } from "../models/comment.model";

const getVideoComments = Asynchandler(async (req, res) => {
    const{videoId} = req.params;
    const {page=1, limit=10} = req.query;
     //TOdo: get all comments for a video
     const comments= await Comment.find({video:videoId}).skip(page*limit).limit(limit);

     if(!comments){
        throw new Apierror(404,"comments not found");
     }

     return  res.status(200).json(new ApiResponse(200, comments, "comments fetched successfully"));

})
const addComment = Asynchandler(async (req, res) => {
    // TODO: add a comment to a video
    const{videoId} = req.params;
    const {content} = req.body;
   const newComment = new Comment({
         video:videoId,
         content:content,
         owner:req.user._id
    })
    await newComment.save();
    return res.status(200).json(new ApiResponse(200,null,"comment added"));

})

const updateComment = Asynchandler(async (req, res) => {
    // TODO: update a comment
    const{commentId} = req.params;
    const {content} = req.body;
   await Comment.findByIdAndUpdate(commentId,
        {
            $set: {content:content}
        }
    )
    return res.status(200).json(new ApiResponse(200,null,"comment updated succesfully"))

})

const deleteComment = Asynchandler (async (req, res) => {
    // TODO: delete a comment
    const{commentId} = req.params;
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponse(200,null,"comment deleted succesfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }