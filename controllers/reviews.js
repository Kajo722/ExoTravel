var Post   = require("../models/post"),
    Review = require("../models/review");


module.exports = {

    // Review Index page
    indexReview (req, res) {
        Post.findById(req.params.id).populate({
            path: "reviews",
            options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
        }).exec(function (err, post) {
            if (err || !post) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            res.render("reviews/index", {post: post});
        });
    },
    
    // New review
    newReview (req, res) {
        Post.findById(req.params.id, function (err, post) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            res.render("reviews/new", {post: post});
    
        });
    },
    
    // Create new review
    createReview (req, res) {
        //lookup post using ID
        Post.findById(req.params.id).populate("reviews").exec(function (err, post) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            Review.create(req.body.review, function (err, review) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                //add author username/id and associated post to the review
                review.author.id = req.user._id;
                review.author.username = req.user.username;
                review.post = post;
                //save review
                review.save();
                post.reviews.push(review);
                // calculate the new average review for the post
                post.rating = calculateAverage(post.reviews);
                //save post
                post.save();
                req.flash("success", "Your review has been successfully added.");
                res.redirect('/posts/' + post._id);
            });
        });
    },
    
    // Edit review form
    editReview (req, res) {
        Review.findById(req.params.review_id, function (err, foundReview) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            res.render("reviews/edit", {post_id: req.params.id, review: foundReview});
        });
    },
    
    // Update review
    updateReview (req, res) {
        Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            Post.findById(req.params.id).populate("reviews").exec(function (err, post) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                // recalculate post average
                post.rating = calculateAverage(post.reviews);
                //save changes
                post.save();
                req.flash("success", "Your review was successfully edited.");
                res.redirect('/posts/' + post._id);
            });
        });
    },
    
    // Delete review
    destroyReview (req, res) {
        Review.findByIdAndRemove(req.params.review_id, function (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            Post.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, post) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                // recalculate post average
                post.rating = calculateAverage(post.reviews);
                //save changes
                post.save();
                req.flash("success", "Your review was deleted successfully.");
                res.redirect("/posts/" + req.params.id);
            });
        });
    }
}

// Function to calculate average rating of the reviews ss
function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}