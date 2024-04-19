const mongoose=require('mongoose')
// const topic=require('./topics_model')
// const reviewer=require('./reviewers_model')

const track=new mongoose.Schema({
    track_name:{
        type:String,
        required:true
    },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
 
    }],
    reviewers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviewer'
    }]

});

const Track=new mongoose.model('Track',track);
module.exports=Track;