const express = require('express')
const passport = require('passport')
const router = express.Router()

// const Image = require('../models/image')
const Gallery = require('../models/gallery')
const User = require('../models/user')

// Dev route
router.get('/all', (req, res) => {
  Gallery.find()
    .populate('owner', ['_id', 'username', 'email'])
    .populate('images')
    .exec()
    .then(galleries => {
      res.status(200).json({
        gallery: galleries
      })
    })
    .catch(error => {
      res.status(400).json(error)
    })
})
router.get('/:id', (req, res) => {
  const id = req.params.id
  Gallery.findById(id)
    .populate('owner', ['_id', 'username', 'email'])
    .populate('images')
    .exec()
    .then(gallery => {
      res.status(200).json(gallery)
    })
    .catch(error => {
      res.status(500).json(error.message)
    })
})
router.put('/:id/edit', (req, res) => {
  const id = req.params.id
  Gallery.findByIdAndUpdate(id, { $set: { name: req.body.name, public: req.body.public } }, { new: true }, (error, gallery) => {
    if (error) {
      res.status(500).json(error.message)
    } else {
      res.status(200).json({
        message: `Gallery name is now ${gallery.name} and visibilty ${gallery.public}`
      })
    }
  })
})
router.post('/newgallery', passport.authenticate('jwt', { session: false }), (req, res) => {
  const id = req.user._id
  const gallery = new Gallery({
    name: req.body.galleryName,
    owner: req.user
  })
  gallery.save()
    .then(() => {
      User.findByIdAndUpdate(id, { $push: { galleries: gallery } }, { new: true }, (error, newGalleryInfos) => {
        if (error) {
          console.log(error)
          console.log('Error adding new gallery')
        } else {
          console.log(newGalleryInfos)
        }
      })
      res.status(201).json({
        message: `New gallery " ${gallery.name} " created`
      })
    })
    .catch(error => {
      res.status(400).json(error)
    })
})
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const id = req.params.id
  Gallery.findByIdAndRemove(id)
    .where('owner').equals(req.user.id)
    .then(deletedGallery => {
      if (deletedGallery <= 0) {
        res.status(403).json({
          error: 'Gallery with this ID not found'
        })
      } else {
        res.status(200).json({
          message: 'Gallery deleted',
          deletedGallery: deletedGallery
        })
      }
    })
    .catch(error => {
      res.status(500).json(error)
    })
})
/*  ADD THIS ROUTE FOR ADMINS ONLY
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;
    Gallery.findByIdAndRemove(id)
        .then(deletedGallery => {
            res.status(200).json({
                message: 'Gallery deleted',
                deletedGallery: deletedGallery
            });
        })
        .catch(error => {
            res.status(500).json(error);
        });
});
 */

module.exports = router
