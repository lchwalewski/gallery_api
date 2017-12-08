const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const gallerySchema = new Schema({
    name: {
        type: String,
        required: true
    }, // Gallery name
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Image',
    }], // Array of images in gallery
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    } // Gallery creator
});


module.exports = mongoose.model('Gallery', gallerySchema);