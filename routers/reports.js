const express=require('express');
const router=express.Router();
const Committee=require('../models/committe_model');
const Member=require('../models/members_model')
const Conference=require('../models/conference_model');
const bodyParser = require('body-parser');
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



module.exports=router;