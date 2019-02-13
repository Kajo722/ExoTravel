var     express = require("express"),
         router = express.Router(),
       passport = require("passport"),
       middleware     = require("../middleware"),
{
    landing,
    registerShow,
    registerPost,
    loginShow,
    logout,
    forgotPass,
    resetPass,
    resetGetToken,
    resetPostToken,
    userProfile,
    userProfileEdit,
    userProfileUpdate
}               = require('../controllers/index')
       

// Landing page route
router.get("/", landing);

// Register form route
router.get("/register", registerShow);

// Register post route
router.post("/register", registerPost);

// Login form route
router.get("/login", loginShow);

// Login post route
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/posts",
        failureRedirect: "/login",
        failureFlash: true
}));


// Logout route
router.get("/logout", logout);

// Reset password form route
router.get("/forgot", forgotPass);

// Reset password post route
router.post('/forgot', resetPass);

// Reset route token creation
router.get('/reset/:token', resetGetToken)

// Reset route token post
router.post('/reset/:token', resetPostToken);

// User profile route
router.get("/users/:id", userProfile);

// User profile edit form route
router.get("/users/:id/edit", middleware.isLoggedIn, userProfileEdit);

// User profile update route
router.put("/users/:id", middleware.isLoggedIn, userProfileUpdate);

module.exports = router;