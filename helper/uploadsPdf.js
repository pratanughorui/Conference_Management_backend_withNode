require('dotenv').config();
const cloudinary = require("cloudinary").v2;
          
cloudinary.config({ 
  cloud_name: process.env.COULD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const uploadFile = async (filePath) => {
    try {
//filePath+='.pdf';
        const result = await cloudinary.uploader.upload(filePath);
        console.log(result);
        return result.url;
    } catch (error) {
        console.error("Error uploading file:", error.message);
    }
}


module.exports = {
    uploadFile
}