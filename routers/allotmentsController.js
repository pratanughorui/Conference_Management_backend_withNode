const express=require('express');
const router=express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const AuthorWork = require('../models/authors_work_model');
const Topic=require('../models/topics_model');
const Track = require('../models/tracks_model');
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Example using Gmail; configure according to your provider
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
router.post('/allotments', async (req, res) => {
    try {
        const allotments = req.body; // Array of { reviewer_id, authorwork_id }

        // Function to check if the reviewer is already assigned to the author work
        const isReviewerAssigned = async (authorworkId, reviewerId) => {
            const authorWork = await AuthorWork.findById(authorworkId);
            return authorWork.reviewers.includes(reviewerId);
        };

        // Create a list of update promises with check for duplicates
        const updatePromises = allotments.map(async allotment => {
            const alreadyAssigned = await isReviewerAssigned(allotment.authorwork_id, allotment.reviewer_id);
            if (alreadyAssigned) {
                return { error: `Reviewer ${allotment.reviewer_id} is already assigned to author work ${allotment.authorwork_id}` };
            }
            return AuthorWork.findByIdAndUpdate(
                allotment.authorwork_id,
                { $addToSet: { reviewers: allotment.reviewer_id } }, // Using $addToSet to avoid duplicates
                { new: true } // Option to return the updated document
            );
        });

        // Execute all update operations in parallel
        const results = await Promise.all(updatePromises);

        // Handle results to filter out errors and successes
        const successfulResults = results.filter(result => !result.error);
        const errorResults = results.filter(result => result.error);

        if (errorResults.length > 0) {
            // Send back errors if any reviewer was already assigned
            res.status(400).json({
                message: "Some allotments failed due to reviewers already being assigned",
                errors: errorResults
            });
        } else {
            // Send back the results of successful updates
            res.status(200).json({
                message: "Reviewers successfully assigned to author works",
                results: successfulResults
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/sendMails/:trackId', async (req, res) => {
   try {
    const { trackId } = req.params;
    const {date,name,designation}=req.body;
    //important part
    const track = await Track.findById(trackId).populate({
        path: 'author_works',
        populate: {
            path: 'reviewers'
        }
    });
  
     //res.send(track);
    if (!track) {
        return res.status(404).json({ message: 'track not found' });
    }
    const emailsSent = await Promise.all(track.author_works.map(async (author_work) => {
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
            //text:'hlwo'
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
