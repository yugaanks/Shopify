var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs=require("express-handlebars");
var mongoose=require("mongoose");
var session=require("express-session");
var passport =require("passport");
var flash=require("connect-flash");
var validator=require("express-validator");
var MongoStore=require("connect-mongo")(session);

var index = require('./routes/index');

var app = express();

mongoose.connect('mongodb://aztec:CS546Aztec@ds137101.mlab.com:37101/aztecdb');
require("./config/passport");
console.log("");
// view engine setup
app.engine('.hbs',expressHbs({defaultLayout:'layout',extname:'.hbs'}));
app.set('view engine', '.hbs');

console.log("1");
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
console.log("2");
app.use(validator());

app.use(cookieParser());

app.use(session({
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection:mongoose.connection}),
  cookie: {maxAge: 12000000}
}));
console.log("3");
//after the session initilization:
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

console.log("4");
app.use(function (req,res,next) {
  res.locals.login=req.isAuthenticated();
  res.locals.session=req.session;
  next();
});

app.use('/', index);
console.log("5");
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found. Please try later.');
  err.status = 404;
  next(err);
});
console.log("6");
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
console.log("7");
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
