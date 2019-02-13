var User          = require("../models/user"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    Post          = require("../models/post"),
    async         = require("async"),
    nodemailer    = require("nodemailer"),
    crypto        = require("crypto");

require("dotenv").config();


module.exports = {
  
  // Landing page
  landing (req, res){
      res.render("landing");
  },

  // Show register form for a new user
  registerShow (req, res){
      res.render("register", {page: "register"});
  },
  
  // Register new user to the site
  registerPost (req, res){
      var newUser = new User({username: req.body.username, firstName: req.body.firstName, lastName:req.body.lastName, description: req.body.description, email: req.body.email, avatar: req.body.avatar});
      if(req.body.adminCode === process.env.SECRET_CODE) {
          newUser.isAdmin = true;
      }
      User.register(newUser, req.body.password, function(err, user) {
          if (err){
              req.flash("error", "Something went wrong, please try again");
              return res.redirect("/register");
          }
          else {
              passport.authenticate("local")(req, res, function(){
                  req.flash("success", "Welcome to ExoTravel " + user.username)
                  res.redirect("/posts");
              });
          }
      });
  },
  
  // Show login form
  loginShow (req, res){
      res.render("login", {page: "login"});
  },
  
  // Logout user from the app
  logout (req, res){
      req.logout();
      req.flash("success", "You have been logged out.")
      res.redirect("/posts");
  },
  
  // Show the form for the password reset
  forgotPass (req, res){
      res.render("forgot")
  },
  
  // Password reset 
  resetPass (req, res, next) {
      async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ email: req.body.email }, function(err, user) {
            if (err || !user) {
              req.flash('error', 'No account with that email address exists.');
              return res.redirect('/forgot');
            }
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            user.save(function(err) {
              done(err, token, user);
            });
          });
        },
        function(token, user, done) {
          var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
              user: 'exotravelweb@gmail.com',
              pass: process.env.GMAILPW
            }
          });
          var mailOptions = {
            to: user.email,
            from: 'exotravelweb@gmail.com',
            subject: 'ExoTravelweb password reset request',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            console.log('mail sent');
            req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            done(err, 'done');
          });
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
      });
    },
  
  // Creating token for the user
  resetGetToken (req, res) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (err || !user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
      });
    },
  
  // Setting up new pasword
  resetPostToken (req, res) {
      async.waterfall([
        function(done) {
          User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (err || !user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
            }
            if(req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
    
                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              })
            } else {
                req.flash("error", "Passwords do not match.");
                return res.redirect('back');
            }
          });
        },
        function(user, done) {
          var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
              user: 'exotravelweb@gmail.com',
              pass: process.env.GMAILPW
            }
          });
          var mailOptions = {
            to: user.email,
            from: 'exotravelweb@gmail.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
          });
        }
      ], function(err) {
        res.redirect('/posts');
      });
    },
  
  // Show User profile page
  userProfile (req, res){
      User.findById(req.params.id, function(err, foundUser){
          if(err || !foundUser){
              req.flash("error", "Can't find the profile.");
              res.redirect("back");
          }
              Post.find().where("author.id").equals(foundUser._id).exec(function(err, posts){
                  if (err){
                      req.flash("error", "Something went wrong");
                      res.redirect("back");
                  }
              res.render("users/show", {user: foundUser, posts: posts});
          })
      });
  },
  
  // Show form for user profile edit
  userProfileEdit (req, res) {
    User.findById(req.params.id, function(err, user) {
      if(err || !user){
        req.flash("error", "Can't find the profile.");
        res.redirect("back");
      } else {
        res.render('users/edit', {user: user})
      }
    });
  },

  // Update user profile information
  userProfileUpdate (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.user, function (err, user) {
      if(err){
        req.flash("error", "Something went wrong.");
         return res.redirect("/posts");
      } else {
        res.redirect("/users/" + req.params.id)
      }
    })
  }  
}
