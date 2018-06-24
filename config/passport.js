const JwtStrategy = require('passport-jwt').Strategy
const extractJwt = require('passport-jwt').ExtractJwt
const cfg = require('../config/auth')

const User = require('../models/user')

module.exports = function (passport) {
  let opts = {}
  opts.jwtFromRequest = extractJwt.fromAuthHeaderWithScheme('jwt')
  opts.secretOrKey = cfg.jwtSecret
  passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    User.findById({ _id: jwtPayload._id }, (err, user) => {
      if (err) {
        return done(err, false)
      }
      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    })
  }))
}
