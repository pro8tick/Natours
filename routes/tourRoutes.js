const express = require('express');
const tourController = require('./../controllers/tourController');
const reviewRoutes= require('./../routes/revieWRoutes')
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');


const router = express.Router();

//POST /tour/21324234/reviews
//GET /tour/234244324/reviews/656676

// router
//       .route('/:tourId/reviews')
//       .post(authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview)

router.use('/:tourId/reviews',reviewRoutes)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours,  tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
      .get(tourController.getToursWithin)

router.route('/distances/:latlng/unit/:unit')
      .get(tourController.getDistance)

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect , 
    authController.restrictTo('admin','lead-guide'), 
    tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.uploadToursImages,
    tourController.resizeTourImages,
    tourController.updateTour)
  .delete(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour);






module.exports = router;
