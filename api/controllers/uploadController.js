const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const imageDownloader = require('image-downloader');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for temporary file upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Handle multiple file uploads
exports.uploadPhotos = (req, res) => {
  const uploadMiddleware = upload.array('photos', 10); // max 10 photos

  uploadMiddleware(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ message: err });
    }

    try {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "urbanrent" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );

          const buffer = file.buffer;
          stream.end(buffer);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      res.json(uploadedUrls);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ message: 'Failed to upload images to cloud storage' });
    }
  });
};

// Handle upload by link
exports.uploadByLink = async (req, res) => {
  const { link } = req.body;
  if (!link) {
    return res.status(400).json({ message: 'Please provide an image URL' });
  }

  try {
    const result = await cloudinary.uploader.upload(link, {
      folder: "urbanrent"
    });
    
    res.json(result.secure_url);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(400).json({ message: 'Failed to upload image from link' });
  }
};