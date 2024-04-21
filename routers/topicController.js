const express=require('express');
const router=express.Router();
const Conference=require('../models/conference_model');
const Track=require('../models/tracks_model');
const Topic=require('../models/topics_model')
router.use(express.json());
router.put('/addtopics/:trackId', async (req, res) => {
    try {
        const { trackId } = req.params;
        const { topics } = req.body;

        // Find the track by ID
        const track = await Track.findById(trackId);
        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }

        // Create new topic documents and push their IDs to the track's topics array
        const topicIds = [];
        for (const topicData of topics) {
            const newTopic = new Topic(topicData);
            await newTopic.save();
            track.topics.push(newTopic._id);
            topicIds.push(newTopic._id);
        }

        // Save the updated track
        await track.save();

        res.status(200).json({ message: 'Topics added successfully', topicIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/gettopicsbytrackid/:trackId', async (req, res) => {
    try {
        const id=req.params.trackId;
        const track = await Track.findById(id).populate("topics");
        if (track) {
            res.json(track.topics);
          } else {
            // If committee is not found, send 404 Not Found
            res.status(404).json({ error: 'Track not found' });
          }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

})
module.exports=router;