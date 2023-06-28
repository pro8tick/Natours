const Tour= require('../models/tourModel');
const User= require('../models/userModel');
const Booking= require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync= require('../utils/catchAsync')


exports.getOverview=catchAsync(async (req,res,next)=>{
    //1- Get tours from collection
   const tours= await Tour.find()   
   //2 build template

    //render that template using tour data from 1
    res.status(200).render('overview',{
      title:'All Tours',
      tours
    });
  })

exports.getTours= catchAsync(async (req,res,next)=>{
    const tour= await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'review rating user'
    })

   
    if(!tour){
      return next(new AppError('There is no Tour with that name',404))
    }
    res.status(200).render('tours',{
      title:`${tour.name} Tour`,
      tour
    });
  })

exports.getLoginForm= (req,res)=>{
  res.status(200)
  .set(
    'Content-Security-Policy',
    "connect-src 'self' http://127.0.0.1:8000/"
  )
  .render('login',{
    title:'Log into Your Account'
  })
}


exports.getResetForm= (req,res)=>{
  res.status(200)
  .set(
    'Content-Security-Policy',
    "connect-src 'self' http://127.0.0.1:8000/"
  )
  .render('resetpassword',{
    title:'Reset Password Form'
  })
}






exports.getSignUpForm= (req,res)=>{
  res.status(200)
  .set(
    'Content-Security-Policy',
    "connect-src 'self' http://127.0.0.1:8000/"
  )
  .render('signup',{
    title:'Sign Up For Natours'
  })
}

exports.getAccount=(req,res)=>{
  res.status(200)
  .set(
    'Content-Security-Policy',
    "connect-src 'self' http://127.0.0.1:8000/"
  )
  .render('account',{
    title:`Your Account`
  });
}

exports.getMyTours= catchAsync( async (req,res)=>{

  const bookings = await Booking.find({user:req.user.id})

  const tourIds = bookings.map(el=>el.tour)

  const tours = await Tour.find({
    _id:{
      $in:tourIds
    }
  })

  res.status(200)
  .set(
    'Content-Security-Policy',
    "connect-src 'self' http://127.0.0.1:8000/"
  )
  .render('overview',{
    title:`My Tours`,
    tours
  });
})


// exports.updateUserData= catchAsync(async (req,res,next) => {
//   const updatedUser = await User.findByIdAndUpdate(req.user.id,{
//     name:req.body.name,
//     email:req.body.email
//   },
//   {
//     new:true,
//     runValidators:true
//   });

//   res.status(200).render('account',{
//     title:`Your Account`,
//     user:updatedUser
//   });
// }) 