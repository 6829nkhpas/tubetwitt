import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_Api_key,
  api_secret: process.env.cloudinary_Api_Secret,
});

console.log(
  "Cloudinary config:",
  process.env.cloudinary_name,
  process.env.cloudinary_Api_key,
  process.env.cloudinary_Api_Secret
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
    throw error; // Re-throw the error instead of returning null
  }
};
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("No public ID provided");
    }
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
    console.log("File deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return null;
  }
};
export { uploadOnCloudinary, deleteFromCloudinary };
console.log(
  process.env.cloudinary_name,
  process.env.cloudinary_Api_key,
  process.env.cloudinary_Api_Secret
);
