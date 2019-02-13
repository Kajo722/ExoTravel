var express      = require("express"),
router           = express.Router({mergeParams: true}),
middleware       = require("../middleware"),
{
    indexReview,
    newReview,
    createReview,
    editReview,
    updateReview,
    destroyReview
} = require('../controllers/reviews');
 
// Reviews Index route
router.get("/", indexReview);

// New review route
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, newReview);

// Create new review route
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, createReview);

// Edit review route
router.get("/:review_id/edit", middleware.checkReviewOwnership, editReview);

// Update review route
router.put("/:review_id", middleware.checkReviewOwnership, updateReview);

// Delete review route
router.delete("/:review_id", middleware.checkReviewOwnership, destroyReview);


module.exports = router;