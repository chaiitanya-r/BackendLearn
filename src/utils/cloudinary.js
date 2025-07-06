import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload a file to Cloudinary
// This function takes a local file path as input and uploads it to Cloudinary.
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,
            { // Options for upload
                resource_type: 'auto' // Automatically detect the resource type (image, video, etc.)
            })
        // console.log('File uploaded successfully to Cloudinary', response.url); // Log the URL of the uploaded file
        fs.unlinkSync(localFilePath); // Delete the local file after upload to save space
        return response; // Return the response containing the file URL and other details
        // console.log(response);
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file if upload fails
        return null;
    }
}

export { uploadOnCloudinary };