const express = require('express');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const Image = require('../models/image');
const Gallery = require('../models/gallery');
const User = require('../models/user');
const router = express.Router();

router.post('/upload', passport.authenticate('jwt', { session: false }), (req, res) => {
    upload(req, res, err => {
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
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    encoding: req.file.encoding,
                    owner: req.user
                });
                image.save()
                    .then(result => {
                        res.status(201).json({
                            success: 'true',
                            message: 'File uploaded',
                            addedImage: result
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        }
    });
});
router.get('/images', passport.authenticate('jwt', { session: false }), (req, res) => {
    Image.find()
        .populate('owner', ['_id', 'username', 'email'])
        .then(images => {
            res.status(200).json(images);
        })
        .catch(err => {
            res.status(404).json({
                error: err
            });
        });
});
router.post('/newgallery', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.user._id;
    const gallery = new Gallery({
        name: req.body.galleryName,
        owner: req.user
    });
    gallery.save()
        .then(() => {
            User.findByIdAndUpdate(id, { $push: { galleries: gallery } }, { new: true },
                (err, doc) => {
                    if (err) {
                        console.log(err);
                        console.log('Error adding new gallery');
                    } else {
                        console.log(doc);
                    }
                }
            );
            res.status(201).json({
                message: `New gallery ${gallery.name} created`
            });
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

router.get('/image/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;
    Image.findById(id)
        .populate('owner', ['_id', 'username', 'email'])
        .then(image => {
            res.status(200).json({
                image: image
            });
        })
        .catch(err => {
            res.status(400).json({
                message: 'Image not found!'
            });
        });
});
router.get('/', (req, res) => {
    Gallery.find()
        .populate('owner', ['_id', 'username', 'email'])
        .populate('images')
        .then(galleries => {
            res.status(200).json({
                gallery: galleries
            });
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

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