const mongoose = require('mongoose');
const Tour= require('./tourModel')
const reviewSchema= new mongoose.Schema({
    review:{
        type:String,
        require:[true,'Review can not be empty!!']
    },
    rating:{
        type:Number,
        min:1,
        ma:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must have a user']
    }
},
{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path:'user',
        select:'name photo'
    })

    next();
})

 reviewSchema.index({tour:1,user:1},{unique:true})

reviewSchema.statics.calcAverageratings = async function(tourId){
    const stats= await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
    //console.log(stats);

    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })

    }

}

reviewSchema.post('save',function(){
    //Review.calcAverageratings()
    this.constructor.calcAverageratings(this.tour);
    
})

//findByIdAndUpdate
//findByIdAndDelete
// reviewSchema.pre(/^findOneAnd/,async function(next){
//     this.r = await this.findOne();
//     //console.log(this.r)
//     next()
// })

// reviewSchema.post(/^findOneAnd/,async function(){
//     //this.findOne(); does't work here as i is already executed
//    await this.r.constructor.calcAverageratings(this.r.tour)
// })

reviewSchema.post(/^findOneAnd/, async function(doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
  });
  

const Review= mongoose.model('Review',reviewSchema)

module.exports=Review;