//User model in database

var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    avatar: {type: String, default: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909__340.png"},
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
    description: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, deafult: false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);