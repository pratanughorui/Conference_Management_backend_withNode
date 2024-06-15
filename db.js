const mongoose=require('mongoose');
require('dotenv').config();
//const dburl='mongodb://localhost:27017/conference_management_system';

const dburl='mongodb+srv://ghoruipratanu:zdk0HiTR6lf42ZmF@conferencemanagementsys.m2uokxu.mongodb.net/';
const mongodbUrl=dburl;
mongoose.connect(mongodbUrl);
const db=mongoose.connection;
db.on('connected',()=>{
    console.log('connected to mongodb server');
})
db.on('error',(err)=>{
    console.log('mongodb server connection error'+err);
})
db.on('disconnected',()=>{
    console.log('mongodb server disconnected');
})