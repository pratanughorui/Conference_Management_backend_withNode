const express=require('express');
const cors = require('cors');
const db=require('./db');
const bodyparser=require('body-parser');
require('dotenv').config();


const app=express();
app.use(cors({
    origin:process.env.FRONTURL||'http://localhost:3000'  // Replace with the actual frontend URL
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
app.use('/conference',conferenceroutes);
app.use('/author',authorsroutes);
app.use('/reviewer',reviewerroutes);
app.use('/paper',allotments);





















const port=process.env.PORT||3030;
app.listen(port,()=>{
    console.log('running.....');
})
