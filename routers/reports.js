const express=require('express');
const router=express.Router();
const Committee=require('../models/committe_model');
const Member=require('../models/members_model')
const Conference=require('../models/conference_model');
const bodyParser = require('body-parser');
const aw=require('../models/authors_work_model');
const { populate } = require('../models/authors_work_model');
router.use(express.json());
router.get('/getListOfFirsrAuthor/:conid',async(req,res)=>{
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:{path:'track'}
        });
        const data=[];
        re.author_works.forEach(element => {
            data.push({
                name:element.name,
                mobile:element.contact_no,
                email:element.email,
                affiliation:element.affiliation,
                country:element.country,
                paper_title:element.title,
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

router.get('/getListOfAllAuthor/:conid',async(req,res)=>{
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
                name:element.name,
                mobile:element.contact_no,
                email:element.email,
                affiliation:element.affiliation,
                country:element.country,
                co_authors:st,
                paper_title:element.title,
                track_name:element.track.track_name,
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

router.get('/getListOfPapersWithReviewer/:conid',async(req,res)=>{
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:[
                {path:'track'},{path:'reviewers'}
            ]
        });
        const data=[];
        re.author_works.forEach(element => {
          
            let st='';
            element.co_authors.forEach(co=>{
             st+=co.name+', ';
            });
            let rn='';
            element.reviewers.forEach(rev=>{
             rn+=rev.name+', ';
            })
            const temp={
                // name:element.name,
                // mobile:element.mobile,
                // email:element.email,
                // affiliation:element.affiliation,
                // country:element.country,
                // co_authors:st,
                // paper_title:element.title,
                // track_name:element.track.track_name,
                track_name:element.track.track_name,
                paper_title:element.title,
                name:element.name,
                co_authors:st,
                reviewers:rn
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

router.get('/getListOfPaperAllotedToReviewer/:conid',async(req,res)=>{
   
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:[
                {path:'track'},{path:'reviewers'}
            ]
        });
        const data=[];
        re.author_works.forEach(element => {
          
            let st='';
            element.co_authors.forEach(co=>{
             st+=co.name+', ';
            });
            element.reviewers.forEach(rev=>{
                const temp={
                // name:element.name,
                // mobile:element.mobile,
                // email:element.email,
                // affiliation:element.affiliation,
                // country:element.country,
                // co_authors:st,
                // paper_title:element.title,
                // track_name:element.track.track_name,
                reviewer:rev.name,
                paper_title:element.title,
                name:element.name,
                co_authors:st,
                last_date:re.last_date_review_sub

            }
            data.push(temp);
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

router.get('/getListOfPaperSentToCopyRight/:conid',async(req,res)=>{
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
                paper_title:element.title,
                name:element.name,
                co_authors:st,
                last_date:re.last_date_review_sub
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
router.get('/getListOfCommitteeMember/:conid', async (req, res) => {
    try {
        const conid = req.params.conid;
        const re = await Conference.findById(conid).populate({
            path: 'committee',
            populate: { path: 'members' }
        });

        const data = {};  // Using an object to group members by committee name
        
        re.committee.forEach(element => {
            if (!data[element.committee_name]) {  // If this committee isn't already a key in data, add it
                data[element.committee_name] = [];
            }

            element.members.forEach(member => {
                const temp = {
                    committee_id: element._id,
                    com_name: element.committee_name,
                    designation: member.role,
                    name: member.name,
                    mobile: member.mobile,
                    email: member.email,
                    affiliation: member.affiliation,
                    country: member.country
                };
                data[element.committee_name].push(temp);  // Push each member into the correct committee array
            });
        });

        res.send(data);
    } catch (error) {
        res.status(500).send({ message: "Failed to retrieve data", error: error });
    }
});

router.get('/getpaperstatus/:conid', async (req, res) => {
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:[
                {path:'track'}
            ]
        });
        const data=[];
        re.author_works.forEach(element => {
          
            let st='';
            element.co_authors.forEach(co=>{
             st+=co.name+', ';
            });
            let ldou = '';
            if (element.updatedAt) {
                ldou = new Date(element.updatedAt).toLocaleDateString();
            }
            const temp={
                track_name:element.track.track_name,
                paper_title:element.title,
                name:element.name,
                co_authors:st,
                keywords:element.keywords,
                status:'',
                ldou:ldou
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
});
router.get('/getreviewers/:conid',async(req,res)=>{
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'tracks',
            populate:[
                {path:'reviewers'}
            ]
        });
        const data=[];
        re.tracks.forEach(element => {
          
           
            element.reviewers.forEach(rev=>{
                const temp={
                    reviewer_id:element._id,
                    track_name:element.track_name,
                    name:rev.name,
                    affiliation:rev.affiliation,
                   country:rev.country,
                   email:rev.email,
                   mobile:rev.mobile
                }
                data.push(temp);
            })

           
            //console.log(element);
        });
        res.send(data);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).send('Internal Server Error');
    }
})

//------------------------list of all papers(first report)
router.get('/getpaperlist/:conid', async (req, res) => {
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:[
                {path:'track'}
            ]
        });
        const data=[];
        re.author_works.forEach(element => {
            // Join the co_authors' names with a comma and space
            let coauthorNames = element.co_authors.map(co => co.name).join(', ');
        
            const temp = {
                _id: element._id,
                track_name: element.track.track_name,
                paper_title: element.title,
                author_name: element.name,
                pdf: element.pdfLink,
                coauthor_name: coauthorNames, // No extra comma at the end
                affiliation: element.affiliation,
                abstract: element.abstract,
                keywords: element.keywords
            };
        
            data.push(temp);
        });
        
        //console.log(re.author_works);
        res.send(data);
    } catch (error) {
         console.error('Error fetching authors:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/getauthorwisepaper/:conid', async (req, res) => {
    try {
        const conid=req.params.conid;
        const re=await Conference.findById(conid).populate({
            path:'author_works',
            populate:[
                {path:'track'}
            ]
        });
        const data=[];
        re.author_works.forEach(element => {
          
            let st='';
            element.co_authors.forEach(co=>{
                if(co.name){
                    st+=co.name+', ';
                    //console.log(co);
                }
             
            });
            // let ldou = '';
            // if (element.updatedAt) {
            //     ldou = new Date(element.updatedAt).toLocaleDateString();
            // }
            const temp={
                track_name:element.track.track_name,
                paper_title:element.title,
                first_author:element.name,
                first_author_email:element.email,
                first_author_country:element.country,
                co_authors:st,
                
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
});

router.get('/gettrackwisepaper/:track_id', async (req, res) => {
    try {
        const trackId = req.params.track_id;
        const papers = await aw.find({ track: trackId }); // Query to find papers with the given track_id

        if (papers.length > 0) {
            const data = [];
            
            papers.forEach(element => {
                let st = '';
                
                if (Array.isArray(element.co_authors)) {
                    element.co_authors.forEach(co => {
                        if (co.name) {
                            st += co.name + ', ';
                        }
                    });
                }
                
                const temp = {
                    title: element.title,
                    name: element.name,
                    email: element.email,
                    country: element.country,
                    co_authors: st ? st.slice(0, -2) : '', // Remove the last comma and space
                };
                data.push(temp);
            });
        
            res.status(200).json(data); // Return the papers if found
        } else {
            res.status(404).json({ message: 'No papers found for this track' }); // Handle case where no papers are found
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Handle server errors
    }
});


// router.get('/getListOfTpcCommitteeMember/:conid', async (req, res) => {
//     try {
//         const conid = req.params.conid;
//         const re = await Conference.findById(conid).populate({
//             path: 'committee',
//             populate: { path: 'members' }
//         });

//         const data = {};  // Using an object to group members by committee name
        
//         re.committee.forEach(element => {
//             if (element.committee_name === "tpc") {
//                 if (!data[element.committee_name]) {  // If this committee isn't already a key in data, add it
//                     data[element.committee_name] = [];
//                 }

//                 element.members.forEach(member => {
//                     const temp = {
//                         committee_id: element._id,
//                         com_name: element.committee_name,
//                         designation: member.role,
//                         name: member.name,
//                         mobile: member.mobile,
//                         email: member.email,
//                         affiliation: member.affiliation,
//                         country: member.country
//                     };
//                     data[element.committee_name].push(temp);  // Push each member into the correct committee array
//                 });
//             }
//         });

//         res.send(data);
//     } catch (error) {
//         res.status(500).send({ message: "Failed to retrieve data", error: error });
//     }
// });




module.exports=router;