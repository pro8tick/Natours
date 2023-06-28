const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = err=>new AppError('Invalid token.Please log in again', 401)
const handleJWTExpiredError=  err=>new AppError('Your token has expired', 401)

const sendErrorDev= (err,req,res)=>{
  //A-api
  if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
      status:err.status,
      error:err,
      message:err.message,
      stack:err.stack
  })
  }else{
    //B-rendered website
    console.error('Error !!!',err);
    return res.status(err.statusCode).render('error',{
      title:'Something went wrong',
      msg:err.message
    })
  }
    
}

const sendErrorProd=(err,req,res)=>{
  if(req.originalUrl.startsWith('/api')){
    //A-api
    
    if(err.isOperational){
      return res.status(err.statusCode).render('error',{
        title:'Something went wrong',
        msg:err.message
      })
    }
  
    //1) Log Error
    console.error('Error !!!',err);
    //2) send generic error message
    return res.status(500).json({
        status: 'error',
        message:'Somethig went very wrong!!!'
    })
  
  }
    //B-rendered website
  if(err.isOperational){
    return res.status(err.statusCode).render('error',{
      title:'Something went wrong',
      msg:err.message
    })
  }

  //1) Log Error
  console.error('Error !!!',err);
  //2) send generic error message
    return res.status(err.statusCode).render('error',{
    title:'Something went wrong',
    msg:'Please try again later'
  })
  
  
    
}

module.exports= (err,req,res,next)=>{
    err.statusCode=err.statusCode||500;
    err.status=err.status|| 'error';
  
    if(process.env.NODE_ENV==='development'){
        sendErrorDev(err,req,res)
    }else if(process.env.NODE_ENV==='production'){
        let error = Object.assign(err);

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
          error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenErrorr')
          error = handleJWTError(error);
        if (error.name === 'TokenExpiredError')
          error = handleJWTExpiredError(error);
    
        sendErrorProd(error,req, res);
    }
  }


