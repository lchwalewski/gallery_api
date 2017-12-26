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
    //const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            console.log(err);
        } else {
            const user = new User({
                email: req.body.email,
                password: hash,
                username: req.body.username
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
    User.findOne({
            email: email
        })
        .exec()
        .then(user => {
            if (!user) {
                res.status(404).json({
                    success: false,
                    msg: 'User not found'
                });
            } else {
                user.comparePassword(password, (err, isMatch) => {
                    if (err) console.log(err);
                    if (isMatch) {
                        const token = jwt.sign(user.toJSON(), config.jwtSecret, {
                            expiresIn: 604800 // 1 week
                        });
                        res.status(201).json({
                            success: true,
                            token: 'JWT ' + token,
                            user: {
                                id: user.id,
                                email: user.email,
                                username: user.username
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
        });
});


module.exports = router;