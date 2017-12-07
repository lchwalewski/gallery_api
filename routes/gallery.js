const express = require('express');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const Image = require('../models/image');
const router = express.Router();


router.post('/upload', passport.authenticate('jwt', { session: false }), (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err);
            res.status(400).json({
                success: 'false',
                message: err
            });
        } else {
            console.log(req.file);
            if (req.file === undefined) {
                res.status(404).json({
                    success: 'false',
                    message: 'No file selected'
                });
            } else {
                const image = new Image({
                    name: req.file.filename,
                    destination: req.file.destination,
                    path: req.file.path,
                    owner: req.user
                });
                image.save((err) => {
                    if (err) console.log(err);
                    res.status(201).json({
                        success: 'true',
                        message: 'File uploaded'
                    });
                });
            }
        }
    });
});
router.get('/images', passport.authenticate('jwt', { session: false }), (req, res) => {
    Image.find((err, images) => {
        if (err) console.log(err);
        res.status(200).render('images', {
            images: images
        });
    }).populate('owner', ['_id', 'username', 'email']);
});
router.get('/imagesjson', passport.authenticate('jwt', { session: false }), (req, res) => {
    Image.find((err, images) => {
        if (err) console.log(err);
        res.status(200).json({
            images: images
        });
    }).populate('owner', ['_id', 'username', 'email']);
});
/* router.get('/:galleryName/:photoId', (req, res) => {
    res.status(200).json({
        galleryName: req.params.galleryName,
        photoId: req.params.photoId
    });
});
 */

// Storage engine
const storage = multer.diskStorage({
    destination: '/public/uploads',
    filename: function(req, file, callback) {
        callback(null, file.filename + '-' + Date.now() + '-' + req.user.username + path.extname(file.originalname));
    }
});
// Init upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 16000000 /* 15.2 MB */
    }, // Max file size in bytes
    fileFilter: function(req, file, callback) {
        checkFileType(file, callback);
    }
}).single('image');

// Check if file type is image
function checkFileType(file, callback) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check if file extension and mime are images
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return callback(null, true);
    } else {
        callback('Error: Images only!');
    }
}
module.exports = router;