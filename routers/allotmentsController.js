const express=require('express');
const router=express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const AuthorWork = require('../models/authors_work_model');
const Topic=require('../models/topics_model');
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Example using Gmail; configure according to your provider
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
router.post('/allotments',async(req,res)=>{
    try {
        const allotments = req.body; // Array of { reviewer_id, authorwork_id }

        // Create a list of update promises
        const updatePromises = allotments.map(allotment =>
            AuthorWork.findByIdAndUpdate(
                allotment.authorwork_id,
                { $addToSet: { reviewers: allotment.reviewer_id } }, // Using $addToSet to avoid duplicates
                { new: true } // Option to return the updated document
            )
        );

        // Execute all update operations in parallel
        const results = await Promise.all(updatePromises);

        // Send back the results of the updates
        res.status(200).json({
            message: "Reviewers successfully assigned to author works",
            results
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
router.post('/sendMails/:topicId', async (req, res) => {
   try {
    const { topicId } = req.params;
    const {date,name,designation}=req.body;
    //important part
    const topic = await Topic.findById(topicId).populate({
        path: 'author_works',
        populate: {
            path: 'reviewers'
        }
    });
  
    // res.send(topic);
    if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
    }
    const emailsSent = await Promise.all(topic.author_works.map(async (author_work) => {
        // const acceptLinks = author_works.reviewers.map(reviewer => {
        //     return `https://mellow-gnome-9a4d4c.netlify.app/review-paper2?reviewerId=${reviewer._id}&authorWorkId=${author_works._id}`;
        // });

        // const rejectLinks = author_work.reviewers.map(reviewer => {
        //     return `http://example.com/reject?reviewerId=${reviewer._id}&authorWorkId=${author_work._id}`;
        // });
        // res.send(acceptLinks+acceptLinks);
        author_work.reviewers.forEach(element => {
            
           const link=`https://mellow-gnome-9a4d4c.netlify.app/review-paper2?reviewerId=${element._id}&authorWorkId=${author_work._id}`;
          const rejectlink=`http://example.com/reject?reviewerId=${element._id}&authorWorkId=${author_work._id}`;
           const mailOptions = {
            from: process.env.EMAIL,
            to: element.email,  // Send to all reviewers
            subject: `Request to review the following paper: ${author_work.title}`,
            text: `Title: ${author_work.title} \n Paper ID: ${author_work._id} \n Author: ${author_work.name} \n Last date of review: ${date} \n Abstract: ${author_work.abstract}.\n\nMessage:\n\nThank you for your willingness to serve as a reviewer. Peer review is one of the most important activities of our Society, and your help is appreciated. Written comments are usually the most helpful part of a review. Please provide comments on the second page or on separate sheets. The grading section below is intended to help identify key points for written comments, and also to allow comparisons among different reviewers. A good paper should have a high overall score, but does not have to score well in all aspects to be acceptable. For example, a concise, critical review paper is a valuable publication, although it might have little intrinsic originality. A paper that introduces important new concepts might be valuable even with limited experimental work.\n\nAccept Review: ${link}\nReject Review: ${rejectlink}\n\nBest regards,\nYour Organization\nsend by: ${name}\ndesignation: ${designation}`,
        };
        return transporter.sendMail(mailOptions);
        //    console.log(link);
        });
        
        //res.send("ff");

        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: author_work.reviewers.map(reviewer => reviewer.email).join(','),  // Send to all reviewers
        //     subject: `Request to review the following paper: ${author_work.title}`,
        //     text: `Title: ${author_work.title} \n Paper ID: ${author_work._id} \n Author: ${author_work.name} \n Last date of review: ${date} \n Abstract: ${author_work.abstract}.\n\nMessage:\n\nThank you for your willingness to serve as a reviewer. Peer review is one of the most important activities of our Society, and your help is appreciated. Written comments are usually the most helpful part of a review. Please provide comments on the second page or on separate sheets. The grading section below is intended to help identify key points for written comments, and also to allow comparisons among different reviewers. A good paper should have a high overall score, but does not have to score well in all aspects to be acceptable. For example, a concise, critical review paper is a valuable publication, although it might have little intrinsic originality. A paper that introduces important new concepts might be valuable even with limited experimental work.\n\nAccept Review: ${acceptLinks.join('\n')}\nReject Review: ${rejectLinks.join('\n')}\n\nBest regards,\nYour Organization\nsend by: ${name}\ndesignation: ${designation}`,
        // };

        // return transporter.sendMail(mailOptions);
    }));

    res.status(200).json({
        message: 'Emails successfully sent to all reviewers.',
        details: emailsSent
    });
} catch (error) {
    console.error('Sending emails failed:', error);
    res.status(500).json({ message: 'Internal server error' });
}
})

router.get('/getpdf/:authorworkId',async(req,res)=>{
    try {
        const authorworkId = req.params.authorworkId;
        const authorwork = await AuthorWork.findById(authorworkId);

        if (!authorwork) {
            return res.status(404).json({ error: 'Author work not found' });
        }

        const pdfFilename = authorwork.pdfLink;
        if (!pdfFilename) {
            return res.status(404).json({ error: 'PDF file not found for this author work' });
        }

        // const filePath = path.join(__dirname, '..', 'uploads', pdfFilename);
        // if (!fs.existsSync(filePath)) {
        //     return res.status(404).json({ error: 'PDF file not found in the uploads directory' });
        // }

        // // Stream the PDF file to the response
        // const stream = fs.createReadStream(filePath);
        // stream.pipe(res);

        res.status(200).json({pdfUrl:pdfFilename});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})




module.exports=router;
