import { v2 as cloudinary } from 'cloudinary';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloudinary_Name, 
        api_key: process.env.cloudinary_Api_key, 
        api_secret: process.env.cloudinary_Api_secret
        });