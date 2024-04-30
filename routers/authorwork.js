const express=require('express');
const multer = require('multer');
const Conference=require('../models/conference_model');
const Topic=require('../models/topics_model');
const Upload=require('../helper/uploadsPdf')
const router=express.Router();
const bodyParser = require('body-parser');
//require('../uploads/')

router.use(bodyParser.json());
const fs = require('fs');
const path = require('path');
const author_work=require('../models/authors_work_model');
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir);
// }
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.resolve('./uploads/')); // Save uploaded files to the 'uploads' directory
//     },
//     filename: function (req, file, cb) {
//          // Save the original filename for now
//          const originalFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
//          req.originalFilename = originalFilename; // Save original filename to request object
//          cb(null, originalFilename);
//       }
// });
//const upload = multer({ storage: storage });
var upload = multer({
    storage: multer.diskStorage({})
});
router.post('/upload/:topicid/:conferenceid/:trackid', upload.single('pdf'), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const { email } = data;
        //console.log(data);
        console.log(req.file);
       
        // Check if the author already exists
        const trackid=req.params.trackid;
        const conference_id = req.params.conferenceid;
        const conference = await Conference.findById(conference_id);
        
        if (!conference) {
            return res.status(404).json({ error: 'Conference not found' });
        }
        
        const existingAuthor = await author_work.findOne({ email });
        
        if (existingAuthor && conference.author_works.includes(existingAuthor._id)) {
           // fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Author already associated with this conference.' });
        }
        const link=await Upload.uploadFile(req.file.path);
        // If author doesn't exist, create a new document
        const newWork = new author_work({
            ...data,
            pdf: req.file.filename, // Save the PDF filename to the database
            pdfLink:link,
            track:trackid
        });
        
         const response = await newWork.save();
        

        const topic_id = req.params.topicid;
        const topic = await Topic.findById(topic_id);
       // res.status(200).json({ message: 'paper submitted successfully' });
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        // // Add the ID of the newly created author work to the topic's author works array
        topic.author_works.push(response._id);
        conference.author_works.push(response._id);
        
        await topic.save();
        await conference.save();

        // console.log("Data saved successfully");
        //res.status(200).json({ message: 'Tracks added successfully'});
         return res.status(201).json({ message: 'paper submitted successfully' });
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

router.get('/getallauthorswithtracks',async(req,res)=>{
    try {
        // Fetch all distinct authors. Assumes you have a field 'authorName' in your schema
        const authors = await author_work.find({}).populate('track');
        res.json(authors);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).send('Internal Server Error');
    }
})
router.get('/getallauthorswithreviewers',async(req,res)=>{
    try {
        // Fetch all distinct authors. Assumes you have a field 'authorName' in your schema
        const authors = await author_work.find({}).populate('reviewers');
        res.json(authors);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).send('Internal Server Error');
    }
})
/*
const conference = await Conference.findById(id).populate({
      path: 'tracks',
      populate: [
          { path: 'topics', populate: { path: 'author_works' } },
          { path: 'reviewers' }
      ]
  }).populate({
    path:'committee',
    populate:'members'
  });
*/
router.get('/getallpaperbyaonid/:conid',async(req,res)=>{
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:{path:'track'}
        });
        const data=[];
        re.author_works.forEach(element => {
            data.push({
                paper_id:element._id,
                paper_title:element.title,
                track_id:element.track._id,
                track_name:element.track.track_name
            })
            //console.log(element);
        });
        //console.log(re.author_works);
        res.send(data);
    } catch (error) {
         console.error('Error fetching authors:', error);
        res.status(500).send('Internal Server Error');
    }
})
router.get('/getallpaper2byaonid/:conid',async(req,res)=>{
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:{path:'track'}
        });
        const data=[];
        re.author_works.forEach(element => {
          
            let st='';
            element.co_authors.forEach(co=>{
             st+=co.name+', ';
            });
            const temp={
                paper_id:element._id,
                paper_title:element.title,
                track_name:element.track.track_name,
                name:element.name,
                email:element.email,
                country:element.country,
                co_authors:st
            }

            
            
            data.push(temp);
            //console.log(element);
        });
        //console.log(re.author_works);
        res.send(data);
    } catch (error) {
         console.error('Error fetching authors:', error);
        res.status(500).send('Internal Server Error');
    }
})

module.exports=router;
