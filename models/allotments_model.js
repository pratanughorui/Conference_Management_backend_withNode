const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
    author_work: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper'
 
    },
    reviewer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviewer'
    }
});
const Paper = mongoose.model('Paper', paperSchema);
module.exports = Paper;