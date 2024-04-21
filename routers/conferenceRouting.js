const express=require('express');
const router=express.Router();
const Conference=require('../models/conference_model');
const Track=require('../models/tracks_model');
const Topic=require('../models/topics_model');
const { populate } = require('../models/authors_work_model');

//-------------------------------------
router.post('/create',async(req,res)=>{
    try {
       // console.log("fff");
     const con=req.body;
     const newconference=new Conference(con);
     const conf=await newconference.save();
    // console.log("data saved");
     res.status(200).json(conf);
    } catch (error) {
      console.error("Error creating conference:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
 })

 router.get('/fetch/:id',async(req,res)=>{
    try {
      const id=req.params.id;
      const con = await Conference.findById(id); 
      if(con){
        res.status(200).json(con);
      }else{
        res.send({error:"not exist"});
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({error:"iternal server error"});
    }
  
  })

 
  



router.get('/getallconference',async(req,res)=>{
 try {
  const conference = await Conference.find().populate({
    path: 'tracks',
    populate: {
        path: 'topics'
    }
});
 res.send(conference);
 } catch (error) {
  console.log(error);
 }
})

router.get('/getconferencebyid/:id',async(req,res)=>{
  try {
    const id=req.params.id;
    const conference = await Conference.findById(id).populate({
      path: 'tracks',
      populate: [
          { path: 'topics', populate: { path: 'author_works' } },
          { path: 'reviewers' }
      ]
  }).populate('committee');
  res.send(conference);
  } catch (error) {
   console.log(error);
  }
 })


  module.exports=router;