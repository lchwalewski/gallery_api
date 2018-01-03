const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
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
    accountType: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    galleries: [{
        type: Schema.Types.ObjectId,
        ref: 'Gallery',
    }]
}, {
    timestamps: { createdAt: 'create_date', updatedAt: 'update_date' }
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) console.log(err);
        callback(null, isMatch);
    });
};
module.exports = mongoose.model('User', userSchema);