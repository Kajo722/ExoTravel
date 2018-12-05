var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    flash          = require("connect-flash"),
    LocalStrategy  = require("passport-local"),
    Campground     = require("./models/campground"),
    Comment        = require("./models/comment"),
    User           = require("./models/user"),
    methodOverride = require("method-override"),
    request        = require("request");

require("dotenv").config();

var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index"),
    reviewRoutes     = require("./routes/reviews")

//App configuration
app.use(methodOverride("_method"));
//mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect(process.env.DATABASEURL);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());

//Express session config

app.use(require("express-session")({
    secret: "hakuuuna matataata ahahaha",
    resave: false,
    saveUninitialized: false
}));

//Passport config

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 

//This adds the variables to every single template in app

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.locals.moment = require('moment');

//ROUTES

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

//Server setup

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelp Camp application server has started");
});