const catchAsync=require('./../utils/catchAsync');
const AppError =require('./../utils/appError');
const APIFeautures= require('./../utils/apiFeatures')

exports.deleteOne= Model=> catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
  
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne= (Model) =>  catchAsync(async (req, res) => {
    const mod = await Model.findByIdAndUpdate(req.params.id, req.body,{
      new:true,
      runValidators:true
    });
    if (!mod) {
      return next(new AppError('No doc found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: mod
      }
    })
  
  });

exports.createOne=(Model)=>catchAsync(async (req, res,next) => {
    const doc= await Model.create(req.body);
      res.status(200).json({
        status: 'success',
        data: {
          data: doc
        }
      })
    
  });
  

exports.getOne = (Model, popOption) => catchAsync(async (req, res,next) => {
        let query= Model.findById(req.params.id);
        if(popOption) query= query.populate(popOption)
        const doc = await query
        if (!doc) {
          return next(new AppError('No doc found with that ID', 404));
        }
      
          res.status(200).json({
            status: 'success',
            data: {
              data:doc
            }
          });
        
      });

exports.getAll = (Model)=> catchAsync(async (req, res,next) => {

    //To Allow for nsted Get review on tour (hack)
    let filter={}
    if(req.params.tourId) filter={tour:req.params.tourId}

    //Execute a query
    const feutures= new APIFeautures(Model.find(filter),req.query).filter().sort().limitFields().paginate()
    const doc = await feutures.query

   res.status(200).json({
     status: 'success',
     results: doc.length,
     data: {
       data:doc
     }
   });
  }); 