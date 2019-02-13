//All middleware of the app
var middleware = {},
    Post       = require("../models/post"),
    Comment    = require("../models/comment"),
    Review     = require("../models/review");

// Middleware to check if given user wrote the Comment
middleware.checkCommentOwnership = function (req, res, next){
        if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found.");
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that.");
                res.redirect("back");
            }
        }
    });
    } else {
        req.flash("error", "Please login first.");
        res.redirect("back");
    };
};

// Middleware to check if given user wrote the Post
middleware.checkPostOwnership = function(req, res, next){
        if(req.isAuthenticated()){
            Post.findById(req.params.id, function(err, foundPost){
            if(err || !foundPost){
                req.flash("error", "Post not found.");
                res.redirect("back");
            } else {
                if(foundPost.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        }
    });
    } else {
        req.flash("error", "Please login first.");
        res.redirect("back");
    }
};

// Middleware to check if the given user wrote the Review
middleware.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

// Middleware to check if given user already wrote the review for given Post
middleware.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Post.findById(req.params.id).populate("reviews").exec(function (err, foundPost) {
            if (err || !foundPost) {
                req.flash("error", "Post not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundPost.reviews
                var foundUserReview = foundPost.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("back");
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

// middleware to check if there is a logged user
middleware.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash("error", "Please login first.")
        res.redirect("/login")
    }
};


module.exports = middleware;