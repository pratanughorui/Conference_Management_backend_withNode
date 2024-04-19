const express=require('express');
const multer = require('multer');
const Conference=require('../models/conference_model');
const Topic=require('../models/topics_model');
const router=express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());
const fs = require('fs');
const path = require('path');
const author_work=require('../models/authors_work_model');
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir);
// }
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Save uploaded files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
         // Save the original filename for now
         const originalFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
         req.originalFilename = originalFilename; // Save original filename to request object
         cb(null, originalFilename);
      }
});
const upload = multer({ storage: storage });
router.post('/upload/:topicid/:conferenceid', upload.single('pdf'), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const { email } = data;
        console.log(data);
        console.log(req.file);
       
        // Check if the author already exists
        const conference_id = req.params.conferenceid;
        const conference = await Conference.findById(conference_id);
        
        if (!conference) {
            return res.status(404).json({ error: 'Conference not found' });
        }
        
        const existingAuthor = await author_work.findOne({ email });
        
        if (existingAuthor && conference.author_works.includes(existingAuthor._id)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Author already associated with this conference.' });
        }

        // If author doesn't exist, create a new document
        const newWork = new author_work({
            ...data,
            pdf: req.file.filename // Save the PDF filename to the database
        });
        
        const response = await newWork.save();
        
        // Rename the PDF file with the author's work ID
        const newFilename = response._id + path.extname(req.originalFilename);
        fs.renameSync(req.file.path, 'uploads/' + newFilename);
        
        // Update the PDF filename in the database
        response.pdf = newFilename;
        await response.save();

        const topic_id = req.params.topicid;
        const topic = await Topic.findById(topic_id);
        
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        // Add the ID of the newly created author work to the topic's author works array
        topic.author_works.push(response._id);
        conference.author_works.push(response._id);
        
        await topic.save();
        await conference.save();

        console.log("Data saved successfully");
        res.status(200).json({ message: 'Tracks added successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/fetchpaperbyid/:id',async(req,res)=>{
    try {
        const id = req.params.id;
        const work = await author_work.findById(id);
        
        if (work) {
            res.status(200).json(work); // Send the reviewer data if found
        } else {
            res.status(404).json({ error: 'author work not found' }); // Send error if reviewer is not found
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports=router;
