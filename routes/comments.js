var    express = require("express"),
        router = express.Router({mergeParams: true}),
    middleware = require("../middleware"),
    { createComment,
      updateComment,
      destroyComment
    } = require('../controllers/comments');

// Post new comment route
router.post("/", middleware.isLoggedIn, createComment);

// Update comment route
router.put("/:comment_id", middleware.checkCommentOwnership, updateComment);

// Delete comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, destroyComment);

module.exports = router;
