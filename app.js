var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    flash          = require("connect-flash"),
    LocalStrategy  = require("passport-local"),
    User           = require("./models/user"),
    methodOverride = require("method-override");

// Require environmental variables
require("dotenv").config();

// Require routes

var commentRoutes    = require("./routes/comments"),
    postRoutes       = require("./routes/posts"),
    indexRoutes      = require("./routes/index"),
    reviewRoutes     = require("./routes/reviews");

// App configuration
app.use(methodOverride("_method"));
// Database connection
mongoose.connect(process.env.DATABASEURL);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());

//Express session configuration

app.use(require("express-session")({
    secret: process.env.PASSPORT_KEY,
    resave: false,
    saveUninitialized: false
}));

//Passport configuration

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
// Setting up local variables

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.locals.moment = require('moment');

// ROUTES

app.use(indexRoutes);
app.use("/posts", postRoutes);
app.use("/posts/:id/comments", commentRoutes);
app.use("/posts/:id/reviews", reviewRoutes);


//Server setup

app.listen(process.env.PORT, process.env.IP, () => console.log("ExoTravel App just started!"));
