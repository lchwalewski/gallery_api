const express = require('express')
const router = express.Router()
const passport = require('passport')

const User = require('../models/user')

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findById({ _id: req.user.id })
    .select('-password -galleries')
    .exec()
    .then(user => {
      res.status(200).json(user)
    })
    .catch(err => {
      res.status(500).json(err)
    })
})
router.put('/edit', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findByIdAndUpdate({ _id: req.user.id }, { $set: { email: req.body.email } }, { new: true }, (error, user) => {
    if (error) {
      res.status(500).json(error.message)
    } else {
      res.status(200).json({
        message: `Your email is now ${user.email}`
      })
    }
  })
})
router.get('/mygalleries', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOne({ _id: req.user.id })
    .populate({
      path: 'galleries',
      populate: {
        path: 'images'
      },
      select: '-password'
    })
    .exec()
    .then(galleries => {
      if (galleries !== 0) {
        res.status(200).json(galleries)
      } else {
        res.status(404).json({
          message: 'You have no galleries'
        })
      }
    })
    .catch()
})
router.get('/myimages', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findById({ _id: req.user.id })
    .select('-password')
    .populate({
      path: 'images',
      populate: {
        path: 'galleries'
      }
    })
    .exec()
    .then(images => {
      /*    let myGalleries = user.galleries;
               let myImages = myGalleries.map(img => img.images).filter(img => img.length > 0); // Creating array of all images from not empty galleries
               if (myImages <= 0) {
                   res.status(200).json({
                       message: 'No images'
                   });
               } else { */
      res.status(200).json(images)
      // }
    })
    .catch(err => {
      res.status(500).json(err)
    })
})

module.exports = router
