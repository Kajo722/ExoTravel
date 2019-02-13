// User model in database

var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    name: String,
    price: String,
    location: String,
    coordinates: Array,
    image: String,
    imageId: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Post", postSchema);