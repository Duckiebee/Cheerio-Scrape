var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");



mongoose.Promise = Promise;

var Note = require("../models/notes.js");
var Article = require("../models/article.js");

router.get("/", function(req, res) {
  res.render("index");
});

router.get("/savedarticles", function(req, res) {

  
  Article.find({}, function(error, doc) {

    if (error) {
      console.log(error);
    }
    else {
      var hbsArticleObject = {
        articles: doc
      };

      res.render("savedarticles", hbsArticleObject);
    }
  });
});

router.post("/scrape", function(req, res) {


  request("http://www.the-leaky-cauldron.org/", function(error, response, html) {
    var $ = cheerio.load(html);

  
    var scrapedArticles = {};
    $("#graywell .post").each(function(i, element) {

      var result = {};

      result.title = $(this).children("a").text();

      console.log(result.title);
      
      result.link = $(this).children("a").attr("href");

      scrapedArticles[i] = result;

    });

    console.log(scrapedArticles);

    var hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("index", hbsArticleObject);

  });
});

router.post("/save", function(req, res) {

  console.log("Title: " + req.body.title);

  var newArticleObject = {};

  newArticleObject.title = req.body.title;

  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);

  console.log(entry);

  entry.save(function(err, doc) {
   
    if (err) {
      console.log("Unable to save article:");
      console.log(err);
    }
   
    else {
      console.log(doc);
    }
  });

  res.redirect("/savedarticles");

});

router.get("/delete/:id", function(req, res) {

  console.log(req.params.id);

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete:");
      console.log(err);
    } else {
          res.redirect("/savedarticles");
    }
  });
});

router.get("/notes/:id", function(req, res) {

  console.log(req.params.id);

  Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Not able to delete:");
      console.log(err);
    } else {
          res.send(doc);
    }
  });
});

router.get("/articles/:id", function(req, res) {

  console.log("ID is getting read" + req.params.id);

  Article.findOne({"_id": req.params.id})

  .populate('notes')

  .exec(function(err, doc) {
    if (err) {
      console.log("Not able to retrieve article notes:");
      console.log(err);
    }
    else {
      res.json(doc);
    }
  });
});


router.post("/articles/:id", function(req, res) {

  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    } 
    else {
     
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})

      .populate('notes')

      .exec(function (err, doc) {
        if (err) {
          console.log("Cannot find article.");
          console.log(err);
        } else {
          console.log(doc.notes);
          res.send(doc);
        }
      });
    }
  });
});

module.exports = router;