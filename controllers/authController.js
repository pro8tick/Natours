const {promisify} =require('util');
const jwt =require('jsonwebtoken');
const User= require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const AppError =require('./../utils/appError');
const Email =require('./../utils/email');
const crypto = require('crypto');


 const signToken = id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
 }

 const createSendtoken=(user,statusCode,res)=>{
    const token = signToken(user._id);
    const cookieOption={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV==='production') cookieOption.secure=true;

    res.cookie('jwt',token,cookieOption);
        //remove password from output
    user.password= undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
 }


exports.signup = catchAsync(async (req,res,next)=>{
    const newUser= await User.create({
        name: req.body.name,
        email: req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role:req.body.role
    });

    const url= `${req.protocol}://${req.get('host')}/me`

    await new Email(newUser,url).sendWelcome();

    createSendtoken(newUser,201,res)
    
})

exports.login= catchAsync( async (req,res,next)=>{
    const {email,password}=req.body;
    //1- check if email and password exists
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400)); 
    }
    //2-check if user exists and password is correct 
    const user=  await User.findOne({email}).select('+password');
    if(!user ){
        return next(new AppError('the user doesnt exist',401));
    }
    const correct=await user.correctPassword(password,user.password);

    if(!correct){
        return next(new AppError('Email or password Incorrect',401));
    }
    //3-if everything ok ,send token to client
    createSendtoken(user,200,res);
})

exports.logout=(req,res)=>{
    res.cookie('jwt','loggedout',{
        expires: new Date(Date.now()+10*1000),
        httpOnly:true
    })
    res.status(200).json({status:'success'})
}

exports.protect = catchAsync(async (req,res,next)=>{
    //1- Geting token and check if its there
   let token;
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
   }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
   if(!token){
    return next(new AppError('You are not logged in!! please log in to get access'),401);
    }
    //2-verification Token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    //console.log(decoded);
    //3-Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError(
            'This user belonging to this token does no longer exist.',
            401
        ))
    }
    //4- Check if user change password after JWT token is issues
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('Password changes recently !! please log in again', 401))
    };
    
    //grant access to protected Rout
    req.user=freshUser;
    res.locals.user=freshUser;
    next();
})

exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        //roles ['admin','lead-guide']
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform action'),403)
        }
        next()
    }
}

//only for render pages ..there will be no error
exports.isLoggedIn = async (req,res,next)=>{
    try{
        if(req.cookies.jwt){
      
            //1-verification Token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
    
            //2-Check if user still exists
            const freshUser = await User.findById(decoded.id);
            if(!freshUser){
                return next();
            }
            //4- Check if user change password after JWT token is issues
            if(freshUser.changedPasswordAfter(decoded.iat)){
                return next()
            };
            
            //There is a logged in user
            res.locals.user=freshUser
            
            return next();
        }
    }catch(err) {
        return next();
    }
    
    next();
}


exports.forgotPassword= catchAsync(async (req,res,next)=>{
    //1) get user based on posted email
    const user= await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user with email Address' ,404))
    }
    //2)generate the random set token
    const resetToken= user.createpasswordresetToken();
    await user.save({validateBeforeSave:false})

    //3) Send it to user's email.
    
    
   try { 
        const resetURL =`${req.protocol}://${req.get('host')}/reset-password`;
        
        await new Email(user, resetURL,resetToken).sendPasswordReset();
        res.status(200).json({
            status:'success',
            mesage: 'Token send to mail!'
        })
    }catch(err){
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});
        

        return next(new AppError('There was an error  sending  the email. Try agaon later!!'),500);
    }
})

exports.resetPassword= async (req,res,next)=>{
    //1- get user based on the token
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user= await User.findOne({passwordResetToken:hashToken,passwordResetExpires:{$gt: Date.now()}});

    //2) If token has not expired and there is user ,set new password
    if(!user){
        return next(new AppError('Token is invalid or expired',400))
    }
    user.password= req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;

    await user.save();
    //
    //4Log the user in,sent JWT
    createSendtoken(user,200,res);
}

exports.updatePassword= catchAsync(async (req,res,next)=>{
    //1) get user from collection
     const user = await User.findById(req.user.id).select('+password')
    //2) check if posted current password is correct
     if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong',401))
     }
    //3) if so update password
    user.password= req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    await user.save();
    //4) log user is, send JWT
    createSendtoken(user,200,res);
}) ;