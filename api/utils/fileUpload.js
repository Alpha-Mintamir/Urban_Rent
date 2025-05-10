const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

/**
 * Uploads a file to Cloudinary storage.
 * 
 * @param {Object} file - Multer file object
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<string>} - URL of the uploaded file
 */
const uploadToCloudinary = async (file, folder = 'broker-documents') => {
  try {
    console.log('Starting Cloudinary upload process for file:', file.originalname);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder,
          resource_type: 'auto',
          // Add any other Cloudinary options here
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('File uploaded successfully to Cloudinary. URL:', result.secure_url);
            resolve(result.secure_url);
          }
        }
      );
      
      // If file is available as a buffer (from memory storage)
      if (file.buffer) {
        uploadStream.end(file.buffer);
      }
      // If file is available as a path (from disk storage)
      else if (file.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
      }
      // Handle invalid file object
      else {
        reject(new Error('Invalid file object - no path or buffer available'));
      }
    });
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Deletes a file from Cloudinary
 * 
 * @param {string} cloudinaryUrl - Full URL of the file on Cloudinary
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
const deleteFromCloudinary = async (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return false;
  }
  
  try {
    // Extract public ID from Cloudinary URL
    const urlParts = cloudinaryUrl.split('/');
    const publicIdWithExtension = urlParts.slice(urlParts.length - 2).join('/');
    const publicId = publicIdWithExtension.split('.')[0]; // Remove extension
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
};

/**
 * Uploads a file to the local storage.
 * In production, you might want to replace this with cloud storage like AWS S3 or Google Cloud Storage.
 * 
 * @param {Object} file - Multer file object
 * @param {string} destination - Destination folder path
 * @returns {string} - URL of the uploaded file
 */
const uploadToLocalStorage = (file, destination) => {
  try {
    console.log('Starting upload process for file:', file.originalname);
    
    // Create uploads directory if it doesn't exist
    const publicDir = path.join(__dirname, '../../public');
    const uploadsBaseDir = path.join(publicDir, 'uploads');
    
    if (!fs.existsSync(publicDir)) {
      console.log('Creating public directory');
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    if (!fs.existsSync(uploadsBaseDir)) {
      console.log('Creating uploads base directory');
      fs.mkdirSync(uploadsBaseDir, { recursive: true });
    }
    
    // Create destination directory if it doesn't exist
    const uploadsDir = path.join(uploadsBaseDir, destination);
    
    if (!fs.existsSync(uploadsDir)) {
      console.log(`Creating destination directory: ${destination}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    console.log(`Copying file from ${file.path} to ${filePath}`);
    
    // Move the file from temp upload location to destination
    fs.copyFileSync(file.path, filePath);
    
    // Remove the temporary file
    fs.unlinkSync(file.path);
    
    // Return the public URL
    const publicUrl = `/uploads/${destination}/${fileName}`;
    console.log('File uploaded successfully. Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadToLocalStorage:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Deletes a file from local storage
 * 
 * @param {string} fileUrl - URL of the file to delete
 * @returns {boolean} - Whether deletion was successful
 */
const deleteFile = (fileUrl) => {
  if (!fileUrl) return false;
  
  try {
    // Check if the URL is a Cloudinary URL
    if (fileUrl.includes('cloudinary.com')) {
      return deleteFromCloudinary(fileUrl);
    }
    
    // Extract file path from URL
    const filePath = path.join(__dirname, '../../public', fileUrl);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  uploadToLocalStorage,
  uploadToCloudinary,
  deleteFile,
  deleteFromCloudinary
}; 