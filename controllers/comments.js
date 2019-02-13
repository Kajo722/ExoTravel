var Post    = require("../models/post"),
    Comment = require("../models/comment");


module.exports = {
    // Create comment logic
    createComment (req, res) {
        //Find post with ID
        Post.findById(req.params.id, function(err, foundPost){
            if (err || !foundPost){
                req.flash("back", "Post not found.");
                res.redirect("/posts");
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
                        foundPost.comments.push(comment);
                        foundPost.save();
                        req.flash("success", "Comment added successfully.");
                        res.redirect("/posts/" + foundPost._id);
                    }
                });
            }
        });
    },
    // Update comment logic
    updateComment (req,res){
        Post.findById(req.params.id, function(err, foundPost){
            if (err || !foundPost){
                req.flash("error", "Post not found.");
                return res.redirect("back");
            }
        Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
            if(err){
                res.redirect("back");
            }
            else{
                req.flash("success", "Comment edited successfully.");
                res.redirect("/posts/" + req.params.id);
                }
            });
        });
    },
    
    // Delete comment logic
    destroyComment (req, res){
        Comment.findByIdAndRemove(req.params.comment_id, function(err){
            if(err){
                res.redirect("back");
            }
            else{
                res.redirect("/posts/" + req.params.id);
            }
        });
    }
};

