var express    = require("express"),
multer         = require('multer'),
router         = express.Router(),
middleware     = require("../middleware"),
{ 
    indexPost,
    newPost,
    createPost,
    showPost,
    editPost,
    updatePost,
    destroyPost
} 
= require("../controllers/posts"),
{
    upload
}
= require('../controllers/map');

// Index post route
router.get("/", indexPost);

// New post route
router.get("/new", middleware.isLoggedIn, newPost);

// Create new post route
router.post("/", middleware.isLoggedIn, upload.single("image"), createPost);

// Show post route
router.get("/:id", showPost);

// Edit post route
router.get("/:id/edit", middleware.checkPostOwnership, editPost);

//Update post route
router.put("/:id", middleware.checkPostOwnership, upload.single("image"), updatePost);

//Destroy post route
router.delete('/:id', middleware.checkPostOwnership, destroyPost);


module.exports = router;