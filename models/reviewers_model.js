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
        type: String
    },
    mobile: String,
    email: {
        type: String,
        required: true,
        unique: true // Ensures uniqueness
    },
    google_sh_id: {
        type: String,
        default: null  // Optional
    },
    orcid_id: {
        type: String,
        default: null  // Optional
    }
});

const Reviewer = mongoose.model('Reviewer', reviewerSchema);
module.exports = Reviewer;
