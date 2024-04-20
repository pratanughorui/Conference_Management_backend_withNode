const express=require('express');
const Conference=require('../models/conference_model');
const committee=require('../models/committe_model');
const router=express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.post('/createcommittee/:id', async (req, res) => {
    try {
        const data = req.body.committees; // Accessing the committees array from the request body
        const id = req.params.id;
        const conference = await Conference.findById(id);
        
        if (!conference) {
            return res.status(404).json({ error: 'Conference not found' });
        }
       console.log(data);
        for (const com of data) {
            const newcom = new committee({ committee_name: com }); // Creating a new committee object
            await newcom.save(); // Saving the new committee to the database
            conference.committee.push(newcom._id); // Adding the ID of the new committee to the conference's committee array
        }

        await conference.save(); // Saving the updated conference object
        
        res.status(200).json({ message: 'Committee added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports=router;