
var express = require("express");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var request = require("request");
var logger = require("morgan");


var notes = require("./models/notes.js");
var article = require("./models/article.js");

mongoose.Promise = Promise;

var PORT = process.env.PORT || 8080;


var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

var handlebars = require("express-handlebars");

app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var routes = require("./controllers/scraperController.js");

app.use("/", routes);

mongoose.connect("mongodb://heroku_6nfz25c1:sqr3kl19aek12j6env5cteo1ri@ds115446.mlab.com:15446/heroku_6nfz25c1");

var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.listen(PORT, function() {
  console.log("App running on PORT " + PORT);
});