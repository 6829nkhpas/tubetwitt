import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloudinary_Name, 
        api_key: process.env.cloudinary_Api_key, 
        api_secret: process.env.cloudinary_Api_secret
        });
        const uploadOnCloudinary = async (localFilePath) => {
            try{
                if(!localFilePath) {
                    return Error("No file path provided");
                }
                const response = await cloudinary.uploader.upload(localFilePath, {
                    resource_type: "auto", // Automatically determine the resource type
                    
                });
                console.log("File uploaded successfully:", response.url);
                fs.unlinkSync(localFilePath);
                return response;

                
            }
            catch(error){
                fs.unlinkSync(localFilePath);
                return null;
                console.log(failed) // Delete the file if upload fails
            }
        }
        export { uploadOnCloudinary };