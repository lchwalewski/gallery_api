const jwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const cfg = require('../config/auth');

const User = require('../models/user');

module.exports = function(passport) {
    let opts = {};
    opts.jwtFromRequest = extractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = cfg.jwtSecret;
    passport.use(new jwtStrategy(opts, (jwt_payload, done) => {
        User.findById({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
};