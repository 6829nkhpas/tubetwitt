import { Asynchandler } from "../utils/Asynchandler.js";
import { User } from "../models/users.model.js";
import { Apierror } from "../utils/errorResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
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
});
export { resgister_user };

console.log(
  "Cloudinary config:",
  process.env.cloudinary_Name,
  process.env.cloudinary_Api_key
);
