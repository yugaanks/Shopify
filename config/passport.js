var passport=require("passport");
var User=require("../models/user");
var LocalStrategy=require("passport-local").Strategy;

var FacebookStrategy=require("passport-facebook").Strategy;
var TwitterStrategy=require("passport-twitter").Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');


passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function (id,done) {
    User.findById(id,function(err,user){
        done(err,user);
    });
});

passport.use("local.signup",new LocalStrategy({
    usernameField:"email",
    passwordField:"password",
    confirmPasswordField:"confirmPassword",
    passReqToCallback:true
},

    function (req,email,password,done) {
    req.checkBody("email","Invalid email format!").notEmpty().isEmail();
    req.checkBody("password","Mininum length of password must be 6!").notEmpty().isLength({min:6});

    // req.checkBody("confirmPassword","Mininum length of password must be 6!").notEmpty().isLength({min:6});
    // if(password != confirmPassword)

    var errors=req.validationErrors();
    if(errors){
        var messages=[];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        // return done(null,false,req.flash("error",messages));
        return done(null,false,req.flash("signupMessage",messages));
    }
    User.findOne({"local.email":email},function(err,user){
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, req.flash('signupMessage', 'Profile with this email already exists!'));
        }
        var newUser=new User();
        newUser.local.email=email;
        newUser.local.password=newUser.encryptPassword(password);
        newUser.save(function (err,result) {
            if(err){
                return done(err);
            }
            return done(null,newUser);
        });
    });
}));

passport.use("local.signin",new LocalStrategy({
    usernameField:"email",
    passwordField:"password",
    passReqToCallback:true
}, function(req,email,password,done) {
    req.checkBody("email","Invalid Email").notEmpty();
    req.checkBody("password","Invalid Password").notEmpty();
    var errors=req.validationErrors();
    if(errors){
        var messages=[];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        // return done(null,false,req.flash("error",messages));
        return done(null,false,req.flash("signinMessage",messages));
    }
    User.findOne({"local.email":email},function(err,user){
        console.log(email + user);
        if(err){
            return done(err);
        }
        if(!user){
            // return done(null,false,{message:"No User Found!!"});
        return done(null, false, req.flash('signinMessage', 'No user found.')); //  set flashdata
        }

        if(!user.validPassword(password)){
            return done(null,false,req.flash("signinMessage","Incorrect Password!"));
            // return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        }
        return done(null,user);
    });
}));

passport.use(new FacebookStrategy({
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name']
},function (token, refreshToken, profile, done) {
    process.nextTick(function () {
        User.findOne({'facebook.id':profile.id},function (err,user) {
            if(err){
                return done(null,user);
            }
            if(user){
                return done(null,user);
            }
            else{
                var newUser            = new User();

                newUser.facebook.id    = profile.id; // set the users facebook id
                newUser.facebook.token = token; // we will save the token that facebook provides to the user
                newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                newUser.save(function (err) {
                    if(err){
                        throw err;
                    }
                    return done(null,newUser);
                });
            }
        })
    })
}));

passport.use(new TwitterStrategy({
    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL
},function (token,tokenSecret,profile,done) {
    process.nextTick(function () {
        User.findOne({"twitter.id":profile.id},function (err,user) {
            if(err){
               return done(err);
            }
            if(user){
                return done(null,user);
            }else{
                var newUser=new User();

                newUser.twitter.id          = profile.id;
                newUser.twitter.token       = token;
                newUser.twitter.username    = profile.username;
                newUser.twitter.displayName = profile.displayName;

                newUser.save(function (err) {
                    if(err){
                        throw err;
                    }
                    return done(null,newUser);
                })
            }
        })
    })
    }
));

// passport.use(new GoogleStrategy({
//         clientID: configAuth.googleAuth.clientID,
//         clientSecret: configAuth.googleAuth.clientSecret,
//         callbackURL: configAuth.googleAuth.callbackURL,
//     },
//     function(token, refreshToken, profile, done) {
//         process.nextTick(function() {
//             User.findOne({ 'google.id': profile.id }, function(err, user) {
//                 if (err)
//                     return done(err);
//                 if (user) {
//                     return done(null, user);
//                 } else {
//                     var newUser = new User();
//                     newUser.google.id = profile.id;
//                     newUser.google.token = token;
//                     newUser.google.name = profile.displayName;
//                     newUser.google.email = profile.emails[0].value;
//                     newUser.save(function(err) {
//                         if (err)
//                             throw err;
//                         return done(null, newUser);
//                     });
//                 }
//             });
//         })
// }))
// ))

passport.use(new GoogleStrategy({
    clientID     : configAuth.googleAuth.clientID,
    clientSecret     : configAuth.googleAuth.clientSecret,
    callbackURL     : configAuth.googleAuth.callbackURL
},
function (token, refreshToken, profile, done) {
    process.nextTick(function () {
        User.findOne({"google.id":profile.id},function (err,user) {
            if(err){
               return done(err);
            }
            if(user){
                return done(null,user);
            }
            else{
                var newUser=new User();

                newUser.google.id = profile.id;
                newUser.google.token = token;
                newUser.google.name = profile.displayName;
                newUser.google.email = profile.emails[0].value;

                newUser.save(function (err) {
                    if(err){
                        throw err;
                    }
                    return done(null,newUser);
                })
            }
        })
    })
    }
))

