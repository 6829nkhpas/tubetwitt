import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Name,
  api_key: process.env.cloudinary_Api_key,
  api_secret: process.env.cloudinary_Api_secret,
});

console.log(
  "Cloudinary config:",
  process.env.cloudinary_Name,
  process.env.cloudinary_Api_key
);

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("No file path provided");
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically determine the resource type
    });
    console.log("File uploaded successfully:", response.url);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};
export { uploadOnCloudinary };
