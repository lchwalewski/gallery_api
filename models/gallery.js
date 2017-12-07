const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gallerySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Gallery', gallerySchema);