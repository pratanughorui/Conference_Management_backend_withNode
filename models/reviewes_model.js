const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
    reviewer_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviewer'
 
    },
    authorwork_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper'
    },
    review_date: {
        type: String,
        required: true
    },
    acceptance: {
        type: String,
        required: true
    },
    total_score:{
        type:Number,
        require:true
    },
    qus_ans: [{
        qus: { type: String, required: true },
        ans: { type: String, required: true },
    }],
    gradding: [{
        max_grade: { type: String, required: true },
        score:{type:Number,require: true},
        min_grade: { type: String, required: true },
    }]
});

const Reviews = mongoose.model('Reviews', reviewsSchema);
module.exports = Reviews;

//zdk0HiTR6lf42ZmF   ghoruipratanu