const mongoose= require('mongoose')
const dotenv = require('dotenv');

// process.on('uncaughtException',err=>{
//   console.log(err.name,err.message);
//   console.log('Uncaught Exception !!! Shutting down....');
//   process.exit(1);
// })

//this line reads config file and add the variable to node npm evironment variable
dotenv.config({ path: './config.env' });
//console.log(process.env)
const app = require('./app');




const DB= process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)
mongoose.connect(DB,{ 
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology: true 
}).then(con=>{
  //console.log(con.connections);
  console.log('DB connection successfull');
}); 


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


process.on('unhandledRejection',err=>{
  console.log('Unhandled rejection !!! Shutting down....');
  console.log(err.name,err.message);
  server.close(()=>{
    process.exit(1);
  })

})

