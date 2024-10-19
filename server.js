const express=require('express');
const cors = require('cors');
const db=require('./db');
const bodyparser=require('body-parser');
require('dotenv').config();


 const app=express();
// app.use(cors({
//     origin : 'http://localhost:5173', //process.env.FRONTURL //'http://localhost:5173'  // Replace with the actual frontend URL
// }));
app.use(cors({
    origin: function (origin, callback) {
        // Replace this with your own logic to check the origin
        if (!origin || origin === process.env.FRONTURL || origin === 'http://localhost:5173') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(bodyparser.json());

app.get('/',(req,res)=>{
    const obj={
        name:'pratanu ghorui',
        age:24,
        department:'cse'
    }
    res.send(obj);
})
const conferenceroutes=require('./routers/conferenceRouting');
const authorsroutes=require('./routers/authorwork');
const reviewerroutes=require('./routers/reviewerController')
const allotments=require('./routers/allotmentsController')
const committee=require('./routers/committeeController');
const members=require('./routers/membersController')
const track=require('./routers/TrackRoutes')
const topic=require('./routers/topicController')
const report=require('./routers/reports')
app.use('/conference',conferenceroutes);
app.use('/author',authorsroutes);
app.use('/reviewer',reviewerroutes);
app.use('/paper',allotments);
app.use('/committee',committee);
app.use('/member',members);
app.use('/track',track);
app.use('/topic',topic);
app.use('/report',report);


const port=process.env.PORT||3030;
app.listen(port,()=>{
    console.log(`running..... on ${port}`);
})
