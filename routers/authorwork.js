const express = require("express");
const multer = require("multer");
const Conference = require("../models/conference_model");
const Topic = require("../models/topics_model");
const Upload = require("../helper/uploadsPdf");
const router = express.Router();
const bodyParser = require("body-parser");
//require('../uploads/')

router.use(bodyParser.json());
const fs = require("fs");
const path = require("path");
const author_work = require("../models/authors_work_model");
const Track = require("../models/tracks_model");
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
  storage: multer.diskStorage({}),
});
router.post(
  "/upload/:conferenceid/:trackid",
  upload.single("pdf"),
  async (req, res) => {
    try {
      const data = JSON.parse(req.body.data);
      const { email } = data;
      //console.log(data);
      console.log(req.file);

      // Check if the author already exists
      const trackid = req.params.trackid;
      const conference_id = req.params.conferenceid;
      const conference = await Conference.findById(conference_id);
      const track = await Track.findById(trackid);
      if (!conference) {
        return res.status(404).json({ error: "Conference not found" });
      }
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }
      const existingAuthor = await author_work.findOne({ email });

      if (
        existingAuthor &&
        conference.author_works.includes(existingAuthor._id)
      ) {
        // fs.unlinkSync(req.file.path);

        return res
          .status(400)
          .json({ error: "Author already associated with this conference." });
      }

      const link = await Upload.uploadFile(req.file.path);
      // If author doesn't exist, create a new document
      const newWork = new author_work({
        ...data,
        pdf: req.file.filename, // Save the PDF filename to the database
        pdfLink: link,
        track: trackid,
      });

      const response = await newWork.save();
      console.log("fffff");
      track.author_works.push(response._id);

      //const topic_id = req.params.topicid;
      //const topic = await Topic.findById(topic_id);
      // res.status(200).json({ message: 'paper submitted successfully' });
      // if (!topic) {
      //     return res.status(404).json({ error: 'Topic not found' });
      // }

      // // Add the ID of the newly created author work to the topic's author works array
      //topic.author_works.push(response._id);
      conference.author_works.push(response._id);

      // await topic.save();
      await track.save();
      await conference.save();

      // console.log("Data saved successfully");
      //res.status(200).json({ message: 'Tracks added successfully'});
      return res
        .status(201)
        .json({
          message: "paper submitted successfully",
          paper_id: response._id,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/deletePaper/:id", async (req, res) => {
  try {
    const paperId = req.params.id;

    // Fetch the paper details from the database by its ID
    const paper = await author_work.findById(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Get the Cloudinary pdf ID stored in the 'pdf' field of the paper
    const pdfId = paper.pdf;

    if (!pdfId) {
      return res
        .status(400)
        .json({ error: "No PDF associated with this paper" });
    }

    // Delete the PDF from Cloudinary using the pdf ID
    const deleteResult = await Upload.deleteFile(pdfId);
    if (!deleteResult) {
      return res
        .status(500)
        .json({ error: "Failed to delete PDF from Cloudinary" });
    }

    console.log("Cloudinary deletion result:", deleteResult);

    // If successful, remove the paper from the database
    await author_work.findByIdAndDelete(paperId);

    return res
      .status(200)
      .json({ message: "Paper and associated PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting paper:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Function to fetch all conferences from the database
async function fetchAllConferences() {
  return await Conference.find(); // Assuming you're using Mongoose
}

// Function to get conference name by author work ID
async function getConferenceNameByAuthorWork(authorWorkId) {
  const conferences = await fetchAllConferences(); // Fetch all conferences

  for (const conference of conferences) {
    // Check if the authorWorkId exists in the conference's author_works array
    if (conference.author_works.includes(authorWorkId)) {
      return conference.conference_title; // Return the conference name if found
    }
  }

  return null; // Return null if no conference contains the author work
}

// Route handler to fetch paper by ID and inject the conference name
router.get("/fetchpaperbyid/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Find the author work and populate the track name
    const work = await author_work.findById(id).populate("track", "track_name");

    if (!work) {
      return res.status(404).json({ error: "author work not found" });
    }

    // Fetch the conference title by author work ID
    const con_title = await getConferenceNameByAuthorWork(id);

    // Convert work to a plain object and inject conference title
    const workWithConferenceTitle = {
      ...work.toObject(), // Convert Mongoose document to a plain object
      conference_title: con_title || "Conference not found", // Add conference title, fallback if not found
    };

    // Send the modified work object with conference title
    res.status(200).json(workWithConferenceTitle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getallauthorswithtracks", async (req, res) => {
  try {
    // Fetch all distinct authors. Assumes you have a field 'authorName' in your schema
    const authors = await author_work.find({}).populate("track");
    res.json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/getallauthorswithreviewers", async (req, res) => {
  try {
    // Fetch all distinct authors. Assumes you have a field 'authorName' in your schema
    const authors = await author_work.find({}).populate("reviewers");
    res.json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Internal Server Error");
  }
});
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
router.get("/getallpaperbyaonid/:conid", async (req, res) => {
  try {
    const conid = req.params.conid;
    const re = await Conference.findById(conid).populate({
      path: "author_works",
      populate: { path: "track" },
    });
    const data = [];
    re.author_works.forEach((element) => {
      data.push({
        paper_id: element._id,
        paper_title: element.title,
        track_id: element.track._id,
        track_name: element.track.track_name,
      });
      //console.log(element);
    });
    //console.log(re.author_works);
    res.send(data);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/getallpaper2byaonid/:conid", async (req, res) => {
  try {
    const conid = req.params.conid;
    const re = await Conference.findById(conid).populate({
      path: "author_works",
      populate: { path: "track" },
    });
    const data = [];
    re.author_works.forEach((element) => {
      let st = "";
      element.co_authors.forEach((co) => {
        st += co.name + ", ";
      });
      const temp = {
        paper_id: element._id,
        paper_title: element.title,
        track_name: element.track.track_name,
        name: element.name,
        email: element.email,
        country: element.country,
        co_authors: st,
      };

      data.push(temp);
      //console.log(element);
    });
    //console.log(re.author_works);
    res.send(data);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getallauthorworkbytrack/:trackid", async (req, res) => {
  try {
    const trackid = req.params.trackid;

    // Assuming trackid is a string that can be converted to an ObjectId
    const authorWorks = await author_work.find({ track: trackid });

    if (!authorWorks.length) {
      return res.status(200).json({});
    }

    res.status(200).json(authorWorks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

async function fetchAllConferences() {
  // Replace this with actual code to fetch data from your database
  return await Conference.find(); // Assuming you are using Mongoose
}

// Function to get conference name by author work ID
async function getConferenceNameByAuthorWork(authorWorkId) {
  const conferences = await fetchAllConferences(); // Fetch all conferences

  for (const conference of conferences) {
    // Check if the authorWorkId exists in the conference's author_works array
    if (conference.author_works.includes(authorWorkId)) {
      return conference.conference_title; // Return the conference name if found
    }
  }

  return null; // Return null if no conference contains the author work
}


router.delete("/deletecoauthor/:author_work_id/:coauthor_id", async (req, res) => {
    const { author_work_id, coauthor_id } = req.params;
  
    try {
      // Find the author work document
      const authorWork = await author_work.findById(author_work_id);
  
      if (!authorWork) {
        return res.status(404).json({ error: "Author work not found" });
      }
  
      // Filter out the co-author with the specified ID
      const updatedCoAuthors = authorWork.co_authors.filter(
        (coAuthor) => coAuthor._id.toString() !== coauthor_id
      );
  
      // Update the document with the modified co-authors array
      authorWork.co_authors = updatedCoAuthors;
      await authorWork.save();
  
      return res.status(200).json({ message: "Co-author deleted successfully" });
    } catch (error) {
      console.error("Error deleting co-author:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
 
  
  

module.exports = router;
