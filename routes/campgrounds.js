//Campground routes

var express    = require("express"),
     router    = express.Router(),
 Campground    = require("../models/campground"),
    Comment    = require("../models/comment"),
    middleware = require("../middleware"),
    request    = require("request"),
        multer = require('multer'),
        Review = require("../models/review")

require("dotenv").config();

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'kajo72', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Shows all campgrounds
router.get("/", function(req, res){
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  return res.render("campgrounds/index", {campgrounds: allCampgrounds, "error": "No match! Please try again!"});
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds});
           }
        });
    }
});

//Shows form to add new campground

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//Adds new campground to database

router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){
    var location = req.body.campground.location;
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
                req.body.campground.coordinates = data.features[0].geometry.coordinates;
                req.body.campground.image = result.secure_url;
                req.body.campground.imageId = result.public_id
                req.body.campground.author = {
                    id : req.user._id,
                    username : req.user.username
                };
                //Create new camp and save in db
                Campground.create(req.body.campground, function(err, newly){
                if(err) {
                    req.flash("error", "Something went wrong");
                    return res.redirect("back");
                }
                else {
                    req.flash("success", "Campground added succesfully.");
                    res.redirect("/campgrounds");
                } 
            })
        });
    }});
});

//Shows page with information about given campground

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});
//Edit campground route

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
        Campground.findById(req.params.id, function(err, foundCampground){
            if (err){
                req.flash("error", "Something went wrong.");
                res.redirect("flash");
            }
            else{
                res.render("campgrounds/edit", {campground:foundCampground});
            }
    });
});
//Update campground route

router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true }, async function(err, updatedCampground){
        if(err){
            req.flash("error", "Something went wrong.");
             return res.redirect("/campgrounds");
        } else {
        if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(updatedCampground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  updatedCampground.imageId = result.public_id;
                  updatedCampground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            var location = updatedCampground.location;
            var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + location + ".json?access_token=" + process.env.MAPBOX_TOKEN;
            request(url, function(error, response, body) {
            var data = JSON.parse(body);
            if (!data.features || !data.features.length){
                req.flash("error", "Location not found.");
                res.redirect("back");
            }
            else {
                updatedCampground.coordinates = data.features[0].geometry.coordinates;
                updatedCampground.save();
                req.flash("success", "Campground edited successfully.");
                res.redirect("/campgrounds/" + req.params.id);   
            }
        })}
    });
});

//Destroy campground route

router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        await Comment.remove({"_id": {$in: campground.comments}});
        await Review.remove({"_id": {$in: campground.reviews}});
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;