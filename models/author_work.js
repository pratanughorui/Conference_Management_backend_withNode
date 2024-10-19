const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
    name: {
        type: String
    },
    affiliation: {
        type: SVGStringList
    },
    country: {
        type: String
    },
    contact_no: String,
    email: {
        type: String,
    },
    google_sh_id: {
        type: String,
        default: null  // Optional
    },
    orcid_id: {
        type: String,
        default: null  // Optional
    },
    title: {
        type: String
    },
    keywords: {
        type: String
    },
    abstract: {
        type: String
    },
    pdf: {
        type: String,
        required: true
    },
    pdfLink:{
    type:String,
    required: true
    },
    co_authors: [{
        name: { type: String, required: true },
        affiliation: { type: String, required: true },
        country: { type: String, required: true },
        contact_no: String,
        email: { type: String, required: true },
        google_sh_id: { type: String, default: null },  // Optional
        orcid_id: { type: String, default: null }       // Optional
    }],
    reviewers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviewer'
    }],
    track:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
    }
});

const Paper = mongoose.model('author_work', paperSchema);
module.exports = Paper;
