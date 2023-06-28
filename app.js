const path=require('path')
const express = require('express');
const morgan = require('morgan');
const rateLimit= require('express-rate-limit')
const helmet =require('helmet')
const AppError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController');
const reviewRouter = require('./routes/reviewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const MongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp= require('hpp');
const cookieParser= require('cookie-parser')



const app = express();

app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))

 //1)global MIDDLEWARES
 //serving static files
 app.use(express.static(path.join(__dirname,'public')));
 //set security HTTP headers


// Further HELMET configuration for Security Policy (CSP)
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://js.stripe.com',
  'https://m.stripe.network',
  'https://*.cloudflare.com'
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.stripe.com',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/'
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
 
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", ...fontSrcUrls],
//       scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
//       frameSrc: ["'self'", 'https://js.stripe.com'],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
//       childSrc: ["'self'", 'blob:'],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//       formAction: ["'self'"],
//       connectSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         'data:',
//         'blob:',
//         ...connectSrcUrls
//       ],
//       upgradeInsecureRequests: []
//     }
//   })
// );

 //developement logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

}

//rate limiter for API from same host
const limiter= rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many requests from this IP,please try again in an Hour!!'
})
app.use('/api',limiter);

//Body parser , reading data from body into req.body
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}))

//cookieparser
app.use(cookieParser())


//Data sanitization against NoSQL query injection
app.use(MongoSanitize());

//Data sanitization against xss 
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}));

app.use(express.static(path.join(__dirname,'public')));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*',(req,res,next)=>{
  // res.status(404).json({
  //   status:'fail',
  //   message:`Can't find ${req.originalUrl} on this server!!`
  // })
  // const err=new Error(`Can't find ${req.originalUrl} on this server!!`)
  // err.status='fail';
  // err.statusCode=404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!!`,404));
})

app.use(globalErrorHandler);
module.exports = app;
