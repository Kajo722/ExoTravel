var    express = require("express"),
        router = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
       Comment = require("../models/comment"),
    middleware = require("../middleware");

//Shows form to add new comment

//Post new comment

router.post("/", middleware.isLoggedIn, function(req, res){
    //Find campground with ID
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err || !foundCampground){
            req.flash("back", "Campground not found.");
            res.redirect("/campgrounds");
        }
        else {
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    req.flash("error", "Something went wrong.");
                    res.redirect("back");
                }
                else {
                    //Add username and id to comment model
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //Save comment
                    comment.save();
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success", "Comment added successfully.");
                    res.redirect("/campgrounds/" + foundCampground._id);
                }
            });
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err || !foundCampground){
            req.flash("error", "Campground not found.");
            return res.redirect("back");
        }
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success", "Comment edited successfully.");
            res.redirect("/campgrounds/" + req.params.id);
            }
        });
    });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


module.exports = router;
