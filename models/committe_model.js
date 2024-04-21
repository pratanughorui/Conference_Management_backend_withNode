const mongoose=require('mongoose')

const committee=new mongoose.Schema({
    committee_name:{
        type:String,
        required:true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'members'
 
    }]
});

const Committee=new mongoose.model('Committee',committee);
module.exports=Committee;