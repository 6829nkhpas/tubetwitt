import { Asynchandler } from "../utils/Asynchandler.js";
import { User } from "../models/users.model.js";
import { Apierror } from "../utils/errorResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Apierror(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Apierror(500, "Error generating tokens");
  }
};

const resgister_user = Asynchandler(async (req, res) => {
  
  const { fullname, email, password, username } = req.body;
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new Apierror(400, ["All fields are required"]);
  }
  const existing = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existing) {
    throw new Apierror(409, "Email or username already exists");
  }
  const avatarLocalnPath = req.files?.avatar?.[0]?.path;
  const coverLocalnPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalnPath || !coverLocalnPath) {
    throw new Apierror(400, "Avatar and cover image are required");
  }
  console.log("req.files:", req.files);
  console.log("avatarLocalnPath:", avatarLocalnPath);
  //  const avatar=await uploadOnCloudinary(avatarLocalnPath);
  //  const coverImage=await uploadOnCloudinary(coverLocalnPath);
  let avatar, coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalnPath);
    console.log("Avatar uploaded successfully:", avatar.url);
  } catch (error) {
    console.log("Error uploading avatar:", error.message);
    throw new Apierror(500, `Failed to upload avatar: ${error.message}`);
  }
  try {
    coverImage = await uploadOnCloudinary(coverLocalnPath);
    console.log("Cover image uploaded successfully:", coverImage?.url);
  } catch (error) {
    console.log("Error uploading cover image:", error.message);
    // If cover image fails, we should clean up the avatar that was already uploaded
    if (avatar?.public_id) {
      await deleteFromCloudinary(avatar.public_id);
    }
    throw new Apierror(500, `Failed to upload cover image: ${error.message}`);
  }
  try {
    const user = await User.create({
      fullname,
      email,
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      password,
    });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new Apierror(504, "User not found");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.log("user creation error:", error);
    if (avatar?.public_id) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage?.public_id) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw new Apierror(512, "images are deleted from cloudinary");
  }
});

const login_user = Asynchandler(async (req, res) => {

  const { email, username, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    throw new Apierror(400, ["All fields are required"]);
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new Apierror(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new Apierror(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!loggedInUser) {
    throw new Apierror(504, "User not found");
  }
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});


const logout_user = Asynchandler(async (req, res) => {
   await User.findByIdAndUpdate(req.user._id, {
    $set : { refreshToken: undefined },
   },
   {new: true}
    );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options) 
  .json(
    new ApiResponse(200, null, "User logged out successfully")
  );
});


const refreshAccessToken = Asynchandler(async (req, res) => {

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new Apierror(401, "Refresh token not provided");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await user.findById(decodedToken?.id);

    if (!user) {
      throw new Apierror(404, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new Apierror(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );

  } catch (error) {
    throw new Apierror(
      500,
      "something went wrong while refreshing access token"
    );
  }
});

const changeCurrentPassword = Asynchandler( async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new Apierror(400, "All fields are required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new Apierror(404, "User not found");
  }
  const isCurrentPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isCurrentPasswordCorrect) {
    throw new Apierror(401, "Invalid current password");
  }
  user.password = newPassword;
  await user.save({validateBeforeSave: false});
  res.status(200).json({ message: "Password changed successfully" });
})

const getcurrentUser = Asynchandler(async (req, res) => {
  if (!req.user) {
    throw new Apierror(401, "User not authenticated");
  }
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = Asynchandler(async (req, res) => {
  const { fullname, email, username } = req.body;
  if ([fullname, email].some((field) => field?.trim() === "")) {
    throw new Apierror(400, ["All fields are required"]);
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new Apierror(404, "User not found");
  }
  user.fullname = fullname;
  user.email = email;
 
  
  await user.save({ validateBeforeSave: false });
  
  const updatedUser = await User.findById(user._id).select("-password -refreshToken");
  
  return res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
})
const updateAvatar = Asynchandler(async (req, res) => {
  const avatarLocalpath = req.file?.path;
  if (!avatarLocalpath) {
    throw new Apierror(400, "Avatar image is required");
  }
 const avatar= await uploadOnCloudinary(avatarLocalpath)
 if(!avatar?.url) {
    throw new Apierror(500, "Failed to upload avatar image");
  }
   
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true}
  ).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
})
const updateCoverImage = Asynchandler(async (req, res) => {
  const coverImageLocalPath =req.file?.path;
  if (!coverImageLocalPath) {
    throw new Apierror(400, "Cover image is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    throw new Apierror(500, "Failed to upload cover image");
  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
})

const getUserChannelProfile = Asynchandler(async (req, res) => {
  const{username}= req.params;
  if(!username
    || username.trim() === ""
  ) {
    throw new Apierror(400, "Username is required");
  }
  const channel= await User.aggregate([
    {
      $match: { username: username.toLowerCase() }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscriberedTo"

       }
    
    },
    {
      $addFields:{
        subscriberCount: { $size: "$subscribers" },

        channelsSubscribedToCount: {
         $size: "$subscriberedTo"
        },
        isSubscribed:{
          $cond:{
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false

          }
        },
        //Project only the necessary fields or data
        $project:{
          fullname: 1,
          username: 1,
          avatar: 1,
          coverImage: 1,
          subscriberCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          email: 1,

        }
      }

    }
  ])
if(channel.length === 0) {
    throw new Apierror(404, "Channel not found");
  }
  return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));

})
 const getWatchHistory = Asynchandler(async (req, res) => { 
   const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user?._id) }
    },{
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline:[
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            } 
          },
          {
            $addFields:{
              owner: { $first: "$owner" }
            }
          }
        
        ]
      }
    }
   ])
    if(user.length === 0) {
      throw new Apierror(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully"));
 })

export {
  refreshAccessToken,
  resgister_user,
  login_user,
  generateAccessTokenAndRefreshToken,
  logout_user,
  changeCurrentPassword,
  getcurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
};

// This code defines user registration and login functionalities using asynchronous handlers.
