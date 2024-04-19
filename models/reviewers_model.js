const mongoose = require('mongoose');

const reviewerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    affiliation: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: String,
    email: {
        type: String,
        required: true,
        unique: true // Ensures uniqueness
    }
});

const Reviewer = mongoose.model('Reviewer', reviewerSchema);
module.exports = Reviewer;
