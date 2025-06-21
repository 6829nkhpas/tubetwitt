import { Asynchandler } from "../utils/Asynchandler.js";
import { User } from "../models/users.model.js";
import { Apierror } from "../utils/errorResponse.js";
import { uploadOnCloudinary ,deleteFromCloudinary, } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessTokenAndRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId);
    if(!user) {
      throw new Apierror(404, "User not found");
    }
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Apierror(500, "Error generating tokens");
    
  }
}
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
    console.log("Avatar uploaded:");
    if (!avatar?.url) {
      throw new Apierror(400, "Avatar upload failed");
    }
  } catch (error) {
    console.log("Error uploading files:", error);
    throw new Apierror(500, "Failed to upload avatar files");
  }
  try {
    coverImage = await uploadOnCloudinary(coverLocalnPath);
    console.log("cover image uploaded:");
  } catch (error) {
    console.log("Error uploading files:", error);
    throw new Apierror(500, "Failed to upload cover image files");
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
    if( coverImage?.public_id) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw new Apierror(512, "images are deleted from cloudinary");
    
  }
});

 const login_user = Asynchandler(async (req, res) => {
  const { email,username, password } = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new Apierror(400, ["All fields are required"]);
  }
  const user = await User.findOne({
    $or:[{username},{email}] });
  if (!user) {
    throw new Apierror(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new Apierror(401, "Invalid credentials");
  }
  const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!loggedInUser) {
    throw new Apierror(504, "User not found");
  }
  const options={
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res.status(200).cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200, {user: loggedInUser,accessToken,refreshToken}, "User logged in successfully")
  );
})
const logout_user = Asynchandler(async (req, res) => {

})
const refreshAccessToken= Asynchandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new Apierror(401, "Refresh token not provided");
  }
  try {
    const decodedToken =jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
     const user =await user.findById(decodedToken?.id)
     if (!user) {
      throw new Apierror(404, "Invalid refresh token");
     }
     if( user.refreshToken !== incomingRefreshToken) {
      throw new Apierror(401, "Invalid refresh token");
     }
     const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
     }
     const {accessToken,refreshToken:newRefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
     return res.status(200).cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json( new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));
  } catch (error) {
    throw new Apierror(500, "something went wrong while refreshing access token");
    
  }
 
});

export {refreshAccessToken, resgister_user,login_user,generateAccessTokenAndRefreshToken };

// This code defines user registration and login functionalities using asynchronous handlers.
