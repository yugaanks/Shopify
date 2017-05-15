var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require("passport");
var Cart = require("../models/cart");

var multer = require("multer");
var upload = multer({ dest: "./public/uploads" });

var Product = require("../models/product");
var Receipt = require("../models/receipt");
var RewardPoints = require("../models/rewardPoints");
var mongoose = require("mongoose");
var helpers = require('handlebars-helpers')();
var rewardTaken = false;

/* GET home page. */
router.get('/', function(req, res, next) {
    Product.find(function(err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize))
        }
        res.render('index', { title: 'Shopify!', products: productChunks });
    });
});

router.get("/about-us", function(req, res, next) {
    res.render("about-us");
});

// router.get("/order-confirmation", function(req, res, next) {
//     res.render("order-confirmation");
// });

router.post("/search", function(req, res, next) {
    Product.find({ title: req.body.search_content }, function(err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize))
        }
        res.render('index', { title: 'Shopify!', products: productChunks });
    });
});

router.get("/upload", function(req, res) {
    res.render("user/upload");
});

router.post("/upload", upload.single("avatar"), function(req, res) {
    var product = new Product({
        imagePath: "../../uploads/" + req.file.filename,
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price)
    });
    product.save(function(err, result) {
        if (err) return console.error(err);
    });
    res.redirect("/");
});

router.post("/checkout", function(req, res) {

    console.log("in");

    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var cartData = [];
    cartData = cart.generateArray();

    var cartProdId = [];

    for (i = 0; i < cartData.length; i++) 
    {
        console.log(cartData[i].item._id);
        cartProdId[i] = cartData[i].item._id;
    }

    console.log("yo2");
    if (!req.user) {
        console.log("yo1");
        var receipt = new Receipt({
            productId: cartProdId,
            date: new Date()
        });
    } 
    else 
    {
        console.log("yo");
        var receipt = new Receipt({
            userId: JSON.stringify(req.user._id),
            productId: cartProdId,
            date: new Date()
        });
    }

    receipt.save(function(err, result) {
        if (err) 
            return console.error(err);

        if(req.user)
        {
            RewardPoints.findOne({userId:JSON.stringify(req.user._id)}, function(err, rewards){
                if (err) 
                    { return next(err); }

                if(rewards)
                {  
                    console.log(rewardTaken + " " + rewards.points + cart.totalPrice/10)

                    if(rewardTaken == false)
                        rewards.points += cart.totalPrice/10;
                    else
                        rewards.points = cart.totalPrice/10;

                    rewards.save(function(err) {
                    if (err) { return next(err); }
                    });
                }
                else
                {
                    var points = new RewardPoints({
                        userId: JSON.stringify(req.user._id),
                        points: cart.totalPrice/10
                    });

                    points.save(function(err, result) {
                    if (err) 
                        return console.error(err);
                });   
                }
            });
        }
    });

    req.session.cart = {};

    res.redirect("/");

});

router.get("/add-to-cart/:id", function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect("/");
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect("/");
    });
});

router.get("/reduce/:id", function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect("/shopping-cart");
});

router.get("/add/:id", function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.addByOne(productId);
    req.session.cart = cart;
    res.redirect("/shopping-cart");
});


router.get("/remove/:id", function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect("/shopping-cart");
});

router.get("/applyRewardPoints/:points", function(req, res, next) {
    var points = req.params.points;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.applyRewardPoints(points);
    req.session.cart = cart;

    rewardTaken = true;
    res.redirect("/shopping-cart");
});

router.get("/removeRewardPoints/:points", function(req, res, next) {
    var points = req.params.points;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeRewardPoints(points);
    req.session.cart = cart;

    rewardTaken = false;
    res.redirect("/shopping-cart");
});


router.get("/shopping-cart", function(req, res, next) {
    if (!req.session.cart) {
        return res.render("shop/shopping-cart", { products: null });
    }

    var cart = new Cart(req.session.cart);

    var currentPoints = 0;
    if(req.user)
    {
        RewardPoints.findOne({userId:JSON.stringify(req.user._id)}, function(err, obj){
            if(obj)
            {
                currentPoints = obj.points;
            }

            res.render("shop/shopping-cart", { products: cart.generateArray(), totalPrice: cart.totalPrice,
                                                rewardPoints: currentPoints });
        });
    }
    else
    {
        res.render("shop/shopping-cart", { products: cart.generateArray(), totalPrice: cart.totalPrice,
                                         rewardPoints: currentPoints });
    }
});

router.get("/checkout", function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect("/shopping-cart");
    }
    var cart = new Cart(req.session.cart);
            
    res.render("shop/checkout", { total: cart.totalPrice});
});

router.get("/profile", isLoggedInFunction, function(req, res, next) {
    console.log(req.user);

    Receipt.findOne({userId:JSON.stringify(req.user._id)}, function(err, obj)
    {
        if(obj)
        {
            Product.find({_id: {$in : obj.productId}}, function(err, objPrd) 
            {
                return objPrd;
            }).then((userProducts) =>
            {
                res.render("user/profile", { "user": req.user, products: userProducts });
            })
        }
        else
        {
            res.render("user/profile", { "user": req.user, products: null });
        }
    });
    // res.render("user/profile", { "user": req.user });
});

router.get("/logout", isLoggedInFunction, function(req, res, next) {
    req.session.destroy();
    req.logout();
    res.redirect("/");
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get("/auth/twitter/callback/",
    passport.authenticate("twitter", {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

router.get('/auth/google', passport.authenticate('google', { scope: ["profile", "email"] }));

router.get("/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

router.use("/", notLoggedIn, function(req, res, next) {
    next();
});

router.get("/signup", function(req, res, next) {
    var messages = req.flash("signupMessage");
    console.log(messages);
    res.render('user/signup', { messages: messages, hasErrors: messages.length > 0 });
});

router.post("/signup", passport.authenticate("local.signup", {
    successRedirect: "/profile",
    failureRedirect: "/signup",
    failureFlash: true
}));

router.get("/signin", function(req, res, next) {
    var messages = req.flash("signinMessage");
    res.render('user/signin', { messages: messages, hasErrors: messages.length > 0 });
});

router.post("/signin", passport.authenticate("local.signin", {
    successRedirect: "/profile",
    failureRedirect: "/signin",
    failureFlash: true
}));

module.exports = router;

function isLoggedInFunction(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}