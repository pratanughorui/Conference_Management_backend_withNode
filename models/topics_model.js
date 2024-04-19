const mongoose=require('mongoose')

const topic=new mongoose.Schema({
    topic_name:{
        type:String,
        required:true
    },
    author_works:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper'
    }]
})

const Topic=new mongoose.model('Topic',topic);
module.exports=Topic;