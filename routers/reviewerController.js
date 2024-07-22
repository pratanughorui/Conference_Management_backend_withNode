const express=require('express');
const router=express.Router();
const Reviewer=require('../models/reviewers_model')
const Track=require('../models/tracks_model');
const author_work=require('../models/authors_work_model');
const reviewes=require('../models/reviewes_model');
const emailverify=require('../helper/emailverification');
const Conference=require('../models/conference_model');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(express.json()); // For parsing application/json
router.use(express.urlencoded({ extended: true })); 


router.post('/create/:track_id', async (req, res) => {
    try {
        const { reviewers } = req.body;
        const trackId = req.params.track_id;

        // Validate that the track exists
        const track = await Track.findById(trackId);
        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }

        // Iterate through each reviewer in the array
        for (const reviewerData of reviewers) {
            const { name, affiliation, country, password, mobile, email } = reviewerData;

            // 1. Validate email address
            if (!emailverify(email)) {
                return res.status(400).json({ error: `email is not valid` });
            }

            // 2. Check if reviewer with the provided email already exists
            const existingReviewer = await Reviewer.findOne({ email });
            if (existingReviewer) {
                if (track.reviewers.includes(existingReviewer._id)) {
                    return res.status(400).json({ error: `Reviewer already exists` });
                } else {
                    track.reviewers.push(existingReviewer._id);
                    await track.save();
                    return res.status(201).json({ message: 'Reviewer added successfully' });
                }
            }

            // 3. If email is genuine and reviewer doesn't exist, save to the database
            const newReviewer = new Reviewer({
                name,
                affiliation,
                country,
                password,
                mobile,
                email,
                track: trackId // Include track ID here
            });
            const savedReviewer = await newReviewer.save();

            // Add the ID of the newly created reviewer to the track's reviewers array
            track.reviewers.push(savedReviewer._id);

            // Save the updated track to the database
            await track.save();
        }

        res.status(201).json({ message: 'Reviewers added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/fetchreviewerbyid/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const reviewer = await Reviewer.findById(id);
        
        if (reviewer) {
            res.status(200).json(reviewer); // Send the reviewer data if found
        } else {
            res.status(404).json({ error: 'Reviewer not found' }); // Send error if reviewer is not found
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' }); // Send internal server error if something goes wrong
    }
});

router.post('/reviewsubmit', async (req, res) => {
    try {
      const review = req.body;
  
      // Log the entire review object for debugging
      //console.log('Received review:', review);
  
      // Check if the review already exists
      const existingReview = await reviewes.findOne({
        reviewer_id: review.review.reviewerId,
        authorwork_id: review.review.paperId
      });
  
      if (existingReview) {
        return res.status(400).json({ error: 'Review already exists' });
      }
  
      // Validate reviewer
      const reviewer = await Reviewer.findById(review.review.reviewerId);
      if (!reviewer) {
        return res.status(404).json({ error: 'Reviewer not found' });
      }
  
      // Validate author
      const author = await author_work.findById(review.review.paperId);
      if (!author) {
        return res.status(404).json({ error: 'Author not found' });
      }
  
      // Create and save new review
      const newReview = new reviewes({
        reviewer_id: review.review.reviewerId,
        authorwork_id: review.review.paperId,
        review_date: review.review.reviewDate,
        acceptance: review.review.acceptance,
        total_score: review.review.totalScore,
        qus_ans: review.coauthor, // Map this field as per your data
        gradding: review.name // Map this field as per your data
      });
  
      await newReview.save();
  
      return res.status(201).json({ message: 'Thank you for your review!' });
  
    } catch (error) {
      console.error('Error handling review submission:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

// router.get('/getallreviewers/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         const conference = await Conference.findById(id);

//         if (!conference) {
//             return res.status(404).json({ error: 'Conference not found' });
//         }

//         // Extracting reviewers from all tracks
//         // const allReviewers = conference.tracks.reduce((reviewers, track) => {
//         //     return [...reviewers, ...track.reviewers];
//         // }, []);
//         console.log(conference.tracks);
//         const reviewerIds = conference.tracks.reduce((ids, track) => {
//             return [...ids, ...track.reviewers];
//         }, []);

//         return res.status(200).json(reviewerIds);
//     } catch (error) {
//         console.error('Error fetching reviewers:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });

router.get('/allreviewersexcurr/:id', async (req, res) => {
    try {
        const conid = req.params.id;
        const conferences = await Conference.find({ _id: { $ne: conid } })
        .populate({
            path: 'tracks',
            populate: {
                path: 'reviewers'
            }
        });
        
        if (conferences.length > 0) { // Check if conferences array is not empty
            let allReviewers = [];
            // Iterate through each conference
            conferences.forEach(conference => {
                // Iterate through each track in the conference
                conference.tracks.forEach(track => {
                    // Add reviewers from each track to the allReviewers array
                    allReviewers.push(...track.reviewers);
                });
            });
            // Send the array of reviewers as the response
            res.json(allReviewers);
        } else {
            res.status(404).json({ error: 'No conferences found' });
        }
    } catch (error) {
        console.error("Error fetching conferences:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/allreviewersbyconid/:id', async (req, res) => {
    try {
        const conid = req.params.id;
        const conference = await Conference.findById(conid).populate({
            path: 'tracks',
            populate: {
                path: 'reviewers'
            }
        });

        if (conference) { // Check if conference is found
            let allReviewers = [];
            // Iterate through each track in the conference
            conference.tracks.forEach(track => {
                // Add reviewers from each track to the allReviewers array
                allReviewers.push(...track.reviewers);
            });
            // Send the array of reviewers as the response
            res.json(allReviewers);
        } else {
            res.status(404).json({ error: 'Conference not found' });
        }
    } catch (error) {
        console.error("Error fetching conference:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/allreviewersbytrackid/:trackId', async (req, res) => {
    try {
        const id=req.params.trackId;
        const track = await Track.findById(id).populate("reviewers");
        if (track) {
            res.json(track.reviewers);
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
