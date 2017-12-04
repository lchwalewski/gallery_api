const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    name: {
        type: String,
        required: true
    }, // The name of the file within the destination
    size: {
        type: Number,
        required: true
    }, // 	Size of the file in bytes
    mimetype: {
        type: String,
        required: true
    }, // Mime type of the file
    destination: {
        type: String,
        required: true
    }, // The folder to which the file has been saved
    path: {
        type: String,
        required: true
    }, // The full path to the uploaded file
    encoding: {
        type: String,
        required: true
    }, // Encoding type of the file
    votes: {
        type: Number,
        required: true,
        default: 0
    }, // Number of "likes"
    description: {
        type: String,
        required: false
    }, // Description of image 
    comments: {
        type: Schema.Types.ObjectId,
        ref: 'Comments'
    }, // Comments added by other users {TBD}
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    } // Informations about user who added image (email, name, etc.)
});

module.exports = mongoose.model('Image', imageSchema);