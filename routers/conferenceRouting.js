const express=require('express');
const router=express.Router();
const Conference=require('../models/conference_model');
const Track=require('../models/tracks_model');
const Topic=require('../models/topics_model');
const { populate } = require('../models/authors_work_model');

//-------------------------------------
router.post('/create', async (req, res) => {
  try {
    console.log('llllllllllllll');
    const con = req.body;
    const newconference = new Conference(con);
    const conf = await newconference.save();
    
    // Delay the response for 5 seconds
    setTimeout(() => {
      res.status(200).json(conf);
    }, 5000); // 5000 milliseconds = 5 seconds
  } catch (error) {
    console.error("Error creating conference:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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
    path: 'tracks'
    // populate: {
    //     path: 'topics'
    // }
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
          // { path: 'topics', populate: { path: 'author_works' } },
          { path: 'reviewers' }
      ]
  }).populate({
    path:'committee',
    populate:'members'
  });
  res.send(conference);
  } catch (error) {
   console.log(error);
  }
 })

 router.get('/conferenceAndTrack/:id', async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.id).populate('tracks');
    
    if (!conference) {
      return res.status(404).send({ message: 'Conference not found' });
    }

    const response = {
      conference_title: conference.conference_title,
      tracks: conference.tracks.map(track => ({
        id: track._id,
        name: track.track_name
      }))
    };

    res.json(response);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});


  module.exports=router;