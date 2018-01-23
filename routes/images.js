const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');

const User = require('../models/user');
const Gallery = require('../models/gallery');
const Image = require('../models/image');

router.get('/all', (req, res) => {
    Image.find({ public: true })
        .populate('owner', ['_id', 'username'])
        .exec()
        .then(images => {
            res.status(200).json(images);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});
router.get('/image/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;
    Image.findById(id)
        .populate('owner', ['_id', 'username'])
        .exec()
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
router.put('/image/:id', (req, res) => {
    const id = req.params.id;
    Image.findByIdAndUpdate(id, { $set: { name: req.body.name, description: req.body.description } }, { new: true }, (error, editedImage) => {
        if (error) return console.log(error) && res.status(500).json({ error: error.message });
        res.status(200).json({
            editedImage: editedImage
        });
    });
});
router.delete('/image/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;
    Image.findByIdAndRemove(id)
        .where('owner').equals(req.user.id)
        .then(deletedImage => {
            if (deletedImage <= 0) {
                res.status(403).json({
                    error: 'Image with this ID not found'
                });
            } else {
                res.status(200).json({
                    message: 'Image deleted',
                    deletedImage: deletedImage
                });
            }
        })
        .catch(error => {
            res.status(500).json(error);
        });
})
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
                    description: req.body.description,
                    owner: req.user
                });
                image.save()
                    .then(result => {
                        User.findByIdAndUpdate(req.user.id, { $push: { images: image } }, { new: true }, (error, newImageInfos) => {
                            if (error) {
                                console.log(error);
                                console.log('Error adding new image');
                            } else {
                                console.log(newImageInfos);
                            }
                        });
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
// Storage engine
const storage = multer.diskStorage({
    destination: '/public/uploads',
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + '-' + req.user.username + path.extname(file.originalname));
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