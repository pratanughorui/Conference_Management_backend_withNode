const mongoose=require('mongoose')

const committee=new mongoose.Schema({
    committee_name:{
        type:String,
        required:true
    }
});

const Committee=new mongoose.model('Committee',committee);
module.exports=Committee;
