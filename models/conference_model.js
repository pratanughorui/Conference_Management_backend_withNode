const mongoose=require('mongoose')
const track=require('./tracks_model')

//create schema
const conference=new mongoose.Schema({
    conference_title:{
        type:String,
        required:true
    },
    short_name:{
        type:String,
    },
    website:{
        type:String,
    },
    venue:{
        type:String,    
    },
    address:{
        type:String,
    },
    place:{
        type:String,
    },
    state:{
        type:String,
    },
    country:{
        type:String,
    },
    from_date:{
        type:String,
    },
    to_date:{
        type:String,
    },
    last_date_paper_sub:{
        type:String,
    },
    // date_allot_paper_torev:{
    //     type:String,
    // },
    // last_date_review_sub:{
    //     type:String,
    // },
    date_of_call_for_paper:{
        type:String,
    },
    number_of_papers:{
        type:String,
    },
    tracks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
 
    }],
    author_works:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper'
    }],
    committee:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Committee'
    }]

    
});
//create conference model
const con=new mongoose.model('Conference',conference);
module.exports=con;