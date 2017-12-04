const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/auth');
const User = require('../models/user');


router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findOne({ _id: req.user._id }, (err, user) => {
        if (err) { console.log(err); } else { res.status(200).json({ user: user }); }
    });
});

router.post('/register', (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    const user = new User({
        email: req.body.email,
        password: hashedPassword,
        username: req.body.username
    });
    user.save((err) => {
        if (err) { console.log(err); } else { res.status(201).json({ message: 'User registered' }); };
    });
});
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email }, (err, user) => {
        if (err) console.log(err);
        if (!user) {
            res.status(404).json({ success: false, msg: 'User not found' });
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
                    return res.status(400).json({ success: false, msg: 'Wrong password' });
                }
            });
        }
    });
});


module.exports = router;