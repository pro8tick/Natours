const mongoose = require('mongoose');
const slugify= require('slugify');
const validator= require('validator');
//const User= require('./userModel');
const toursSchema= new mongoose.Schema(
    {
      name:{
        type:String,
        required:[true,'A tour must have a price'],
        unique:true,
        maxlength:[40,'A tour name must have less than 40 char'],
        minlength:[10,'A tour name must have more than 10 char'],
        //validate:[validator.isAlpha,'Tour name must only content character']
      },
      slug: String,
      duration:{
        type: Number,
        required:[true,'A tour must have a duration']
      },
      maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
      },
      difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
          values: ['easy', 'medium', 'difficult'],
          message: 'Difficulty is either: easy, medium, difficult'
        }
      },
      ratingsAverage: {
        type: Number,
        default: 4.5,
        min:[1,'A rating must be above 1.0'],
        max:[5,'A rating must be below 5.0'],
        set: val=>Math.round(val*10)/10 //4.66666,46.6666,47,4.7
      },
      ratingsQuantity: {
        type: Number,
        default: 0
      },
      price:{
        type:Number,
        required:[true,'A tour must have a price']
      },
      priceDiscount: {
        type: Number,
        validate: {
          //this only points to certain doc on new document  creation
          validator:function(val){
            return val< this.price;
          },
          message:'dicount({VALUE}) should not be greator that price'
        }
      },
      description: {
          type: String,
          trim: true
        },
      imageCover: {
          type: String,
          required: [true, 'A tour must have a cover image']
        },
      images: [String],
      summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
      },
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false
      },
      startDates: [Date],
      secretTour: {
        type: Boolean,
        default: false
      },
       secretTour:{
        type:Boolean,
        default:false
       },
       startLocation:{
        //GeoJSON
        type:{
          type:String,
          default:'Point',
          enum:['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
       },
       locations:[{
        type:{
          type:String,
          default:'Point',
          enum:['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
       }
      ],
      guides:[{
        type: mongoose.Schema.ObjectId,
        ref:'User'
      }],

    },
    {
      toJSON:{virtuals:true},
      toObject:{virtuals:true}
    }
)

//toursSchema.index({price:1})
toursSchema.index({price:1,ratingsAverage:-1})
toursSchema.index({slug:1})
toursSchema.index({startLocation:'2dsphere'})

toursSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
  })

toursSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})

  // DOCUMENT MIDDLEWARE: runs before .save() and .create()
  //doesnt work for update
toursSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});


// toursSchema.pre('save', async function(next) {
//   const guidePromises= this.guides.map(async id=> await User.findById(id));
//   this.guides= await Promise.all(guidePromises);
//   next();
// });
// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });


//query middleware

//toursSchema.pre('find', function(next) 
toursSchema.pre(/^find/, function(next)
{
  this.find({secretTour:{$ne:true}})
  this.start= Date.now();
  next();
})

toursSchema.post(/^find/, function(docs,next)
{
  console.log(`Query took ${Date.now()-this.start} millisecond`);
  //console.log(docs)
  next();
})

toursSchema.pre(/^find/, function(next){
  this.populate({
    path:'guides',
    select:'-__v -passwordChangedAt'
  })
  next();
})
//AGGREGATION MIDDLEware
// toursSchema.pre('aggregate',function(next){
//   this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//   //console.log(this);
//   next();
// })

  const Tour= mongoose.model('Tour',toursSchema);

  module.exports= Tour
