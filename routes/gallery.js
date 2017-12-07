const express = require('express');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const Image = require('../models/image');
const Gallery = require('../models/gallery');
const User = require('../models/user');
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
router.post('/newgallery', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.user._id;
    console.log(id);
    const gallery = new Gallery({
        name: req.body.galleryName,
        owner: req.user
    });
    gallery.save((err) => {
        if (err) { console.log(err); } else {
            User.findByIdAndUpdate(id, { $push: { gallerys: gallery } }, { new: true }, (err, doc) => {
                if (err) {
                    console.log(err);
                    console.log('Error adding new gallery');
                } else {
                    console.log(doc);
                }
            });
            res.status(201).json({ message: `New gallery ${gallery.name} created` });
        }
    });
});

router.get('/image/:id', (req, res) => {
    const id = req.params.id;
    Image.findById(id, (err, image) => {
        if (err) console.log(err);
        res.status(200).json({ image: image });
    }).populate('owner', ['_id', 'username', 'email']);
});
router.get('/', (req, res) => {
    Gallery.find((err, gallerys) => {
        if (err) console.log(err);
        res.status(200).json({ gallery: gallerys });
    }).populate('owner', ['_id', 'username', 'email']).populate('images');
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