var request    = require("request"),
    multer     = require('multer'),
    Review     = require("../models/review"),
    Post       = require("../models/post"),
    Comment    = require("../models/comment"),
    cloudinary = require('cloudinary');

// Require env variables
require("dotenv").config();

// Cludinary configuration for image upload
cloudinary.config({ 
    cloud_name: 'kajo72', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = {
    
    // Index page for posts
    indexPost (req, res) {
        if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            // Get all posts from DB
            Post.find({name: regex}, function(err, allPosts){
               if(err){
                req.flash("error", "Something went wrong");
                return res.redirect("back");
               } else {
                  if(allPosts.length < 1) {
                      return res.render("posts/index", {postss: allPosts, "error": "No match! Please try again!"});
                  }
                  res.render("posts/index",{posts:allPosts});
               }
            });
        } else {
            // Get all posts from DB
            Post.find({}, function(err, allPosts){
               if(err){
                req.flash("error", "Something went wrong");
                return res.redirect("back");
               } else {
                  res.render("posts/index",{posts:allPosts});
               }
            });
        }
    },
    
    // New post form
    newPost (req, res){
        res.render("posts/new");
    },
    
    // Create new post
    createPost (req, res){
        var location = req.body.post.location;
        var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + location + ".json?access_token=" + process.env.MAPBOX_TOKEN;
        request(url, function(error, response, body) {
            var data = JSON.parse(body);
            if (!data.features || !data.features.length){
                req.flash("error", "Location not found." );
                return res.redirect("back");
            } else{
                cloudinary.v2.uploader.upload(req.file.path, function(err,result){
                    if(err){
                        req.flash("error", "Something went wrong");
                        return res.redirect("back");
                    }
                    req.body.post.coordinates = data.features[0].geometry.coordinates;
                    req.body.post.image = result.secure_url;
                    req.body.post.imageId = result.public_id
                    req.body.post.author = {
                        id : req.user._id,
                        username : req.user.username
                    };
                    //Create new post and save in db
                    Post.create(req.body.post, function(err, newly){
                    if(err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("back");
                    }
                    else {
                        req.flash("success", "Post added succesfully.");
                        res.redirect("/posts");
                    } 
                })
            });
        }});
    },
    
    // Show given post
    showPost (req, res) {
        //find the post with provided ID
        Post.findById(req.params.id).populate("comments").populate({
            path: "reviews",
            options: {sort: {createdAt: -1}}
        }).exec(function (err, foundPost) {
            if (err || !foundPost) {
                req.flash("error", "Something went wrong");
                res.redirect("back");
            } else {
                //render show template with that post
                res.render("posts/show", {post: foundPost});
            }
        });
    },
    
    // Edit post form
    editPost (req, res){
        Post.findById(req.params.id, function(err, foundPost){
            if (err){
                req.flash("error", "Something went wrong.");
                res.redirect("back");
            }
            else{
                res.render("posts/edit", {post:foundPost});
            }
    });
    },
    
    // Update post
    updatePost (req, res){
        Post.findByIdAndUpdate(req.params.id, req.body.post, { new: true }, async function(err, updatedPost){
            if(err){
                req.flash("error", "Something went wrong.");
                 return res.redirect("/posts");
            } else {
            if (req.file) {
                  try {
                      await cloudinary.v2.uploader.destroy(updatedPost.imageId);
                      var result = await cloudinary.v2.uploader.upload(req.file.path);
                      updatedPost.imageId = result.public_id;
                      updatedPost.image = result.secure_url;
                  } catch(err) {
                      req.flash("error", err.message);
                      return res.redirect("back");
                  }
                }
                var location = updatedPost.location;
                var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + location + ".json?access_token=" + process.env.MAPBOX_TOKEN;
                request(url, function(error, response, body) {
                var data = JSON.parse(body);
                if (!data.features || !data.features.length){
                    req.flash("error", "Location not found.");
                    res.redirect("back");
                }
                else {
                    updatedPost.coordinates = data.features[0].geometry.coordinates;
                    updatedPost.save();
                    req.flash("success", "Post edited successfully.");
                    res.redirect("/posts/" + req.params.id);   
                }
            })}
        });
    },
    
    // Delete post
    destroyPost (req, res) {
        Post.findById(req.params.id, async function(err, post) {
          if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          try {
              await cloudinary.v2.uploader.destroy(post.imageId);
              await Comment.remove({"_id": {$in: post.comments}});
              await Review.remove({"_id": {$in: post.reviews}});
              post.remove();
              req.flash('success', 'Post deleted successfully!');
              res.redirect('/posts');
          } catch(err) {
              if(err) {
                req.flash("error", err.message);
                return res.redirect("back");
              }
          }
        });
      }
}
