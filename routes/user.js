const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth');

const User = require('../models/user');
const Gallery = require('../models/gallery');
const Image = require('../models/image');


router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById({ _id: req.user.id })
        .select('-password -galleries')
        .exec()
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

router.post('/register', (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    // TODO: Check if email or username exists
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            console.log(err);
        } else {
            const user = new User({
                email: email,
                password: hash,
                username: username
            });
            user.save()
                .then((result) => {
                    console.log(result);
                    res.status(201).json({
                        message: 'User registered'
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json(err);
                });
        }

    });

});
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (!user) {
                res.status(404).json({
                    success: false,
                    msg: 'Authorization error'
                });
            } else {
                user.comparePassword(password, (err, isMatch) => {
                    if (err) console.log(err);
                    if (isMatch) {
                        const token = jwt.sign(user.toJSON(), config.jwtSecret, {
                            expiresIn: 604800 // 1 week
                        });
                        res.status(201).json({
                            token: 'JWT ' + token,
                            user: {
                                id: user.id,
                                email: user.email,
                                username: user.username,
                                accountType: user.accountType
                            }
                        });
                    } else {
                        return res.status(400).json({
                            success: false,
                            msg: 'Wrong password or email'
                        });
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});


module.exports = router;