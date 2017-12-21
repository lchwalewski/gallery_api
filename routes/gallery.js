const express = require('express');
const passport = require('passport');
const router = express.Router();

const Image = require('../models/image');
const Gallery = require('../models/gallery');
const User = require('../models/user');


router.get('/', (req, res) => {
    Gallery.find()
        .populate('owner', ['_id', 'username', 'email'])
        .populate('images')
        .exec()
        .then(galleries => {
            res.status(200).json({
                gallery: galleries
            });
        })
        .catch(err => {
            res.status(400).json(err);
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
            User.findByIdAndUpdate(id, { $push: { galleries: gallery } }, { new: true }, (err, doc) => {
                if (err) {
                    console.log(err);
                    console.log('Error adding new gallery');
                } else {
                    console.log(doc);
                }
            });
            res.status(201).json({
                message: `New gallery ${gallery.name} created`
            });
        })
        .catch(err => {
            res.status(400).json(err);
        });
});



module.exports = router;