const express=require('express');
const router=express.Router();
const Conference=require('../models/conference_model');
const Track=require('../models/tracks_model');
router.use(express.json());
router.put('/addtracks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { tracks } = req.body;
  
      // Check if the conference exists
      const conference = await Conference.findById(id);
      if (!conference) {
        return res.status(404).json({ error: 'Conference not found' });
      }
  
      // Create new track documents and push their IDs to the conference's tracks array
      const trackIds = [];
      for (const trackData of tracks) {
        const newTrack = new Track(trackData);
        await newTrack.save();
        conference.tracks.push(newTrack._id);
        trackIds.push(newTrack._id);
      }
  
      // Save the updated conference
      await conference.save();
  
      res.status(200).json({ message: 'Tracks added successfully', trackIds });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  router.get('/gettracksbyconid/:conid',async(req,res)=>{
    try {
        const id=req.params.conid;
        const conference = await Conference.findById(id).populate("tracks");
        if (conference) {
            res.json(conference.tracks);
          } else {
            // If committee is not found, send 404 Not Found
            res.status(404).json({ error: 'Conference not found' });
          }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
  })

  module.exports=router;