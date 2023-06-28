const fs = require('fs')
const mongoose= require('mongoose')
const dotenv = require('dotenv');
const Tour= require('./../../models/tourModel')
const Review= require('./../../models/reviewModel')
const User= require('./../../models/userModel')

//this line reads config file and add the variable to node npm evironment variable
dotenv.config({ path: `${__dirname}/../.././config.env` });
//console.log(process.env)


const DB= process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology: true
}).then(con=>{
  //console.log(con.connections);
  console.log('DB connection successfull');
}).catch((err)=>{
  console.log(err)
});

//read json
const tours= JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users= JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const review= JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))

const importData = async ()=>{
    try{
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false});
        await Review.create(review);
        console.log('data successfully loaded')
        process.exit()
    }catch(err){
        console.log(err)
    }
}

const  deleteData= async ()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('data successfully deleted')
        process.exit()
    }catch(err){
        console.log(err)
    }
}

if (process.argv[2] === '--import') {
    importData();
  } else if (process.argv[2] === '--delete') {
    deleteData();
  }
  