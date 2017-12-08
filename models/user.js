const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, // User email, [private]
    username: {
        type: String,
        required: true,
        unique: true
    }, // User account name, [public]
    password: {
        type: String,
        required: true
    },
    galleries: [{
        type: Schema.Types.ObjectId,
        ref: 'Gallery',
    }]
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) console.log(err);
        callback(null, isMatch);
    });
};
module.exports = mongoose.model('User', userSchema);