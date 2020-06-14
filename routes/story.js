const express = require('express');
const router  = express.Router({ mergeParams: true });

const { ensureAuthenticated, } = require('../config/auth');

const Author  = require('../models/author');
const Story   = require('../models/story');
const Chapter = require('../models/chapter');
const Review  = require('../models/review');

router.get('/:story_id', (req, res) => {
  Author
    .findById(req.params.author_id, (err, author) => {
      if (err) {
        console.log(err);
        res.redirect('/author/' + req.params.author_id);
      } else {
        Story
          .findById(req.params.story_id, (err, story) => {
            if (err) {
              console.log(err);
              res.redirect('/author/' + req.params.author_id);
            } else {
              Chapter
                .find({ _id: story.chapters }, (err, chapters) => {
                  if (err) {
                    console.log(err);
                    res.redirect('/author/' + req.params.author_id);
                  } else {
                    Review
                      .find({ _id: story.reviews }, (err, reviews) => {
                        if (err) {
                          console.log(err);
                          res.redirect('/author/' + req.params.author_id);
                        } else {
                          chapters.sort((a, b) => a.created > b.created ? 1 : a.created < b.created ? -1 : 0); // OLDER FIRST
                          reviews.sort((a, b) => a.created < b.created ? 1 : a.created > b.created ? -1 : 0); // NEWER FIRST
                          res.render('story', { author, story, chapters, reviews });
                        }
                    });
                  }
              });
            }
          });
      }
    });
});

router.post('/', ensureAuthenticated, (req, res) => {
  const newStory = new Story({
    title: req.body.title,
    description: req.body.description,
    chapters: [],
    reviwes: [],
    created: Date.now()
  });
  newStory
    .save()
    .then(story => {
      Author
        .findById(req.user.author.id, (err, author) => {
          if (err) {
            console.log(err);
            res.redirect('/author/' + req.params.author_id);
          } else {
            author.stories.push(story._id);
            Author
              .findOneAndUpdate({ _id: author._id }, { stories: author.stories }, err => {
                if (err) console.log(err);
                else {
                  req.flash('success', `Story "${story.title}" was created!`);
                  res.redirect('/author/' + req.user.author.id);
                }
              });
          }
        });
    });
});

router.put('/:story_id', ensureAuthenticated, (req, res) => {
  Story
    .findOneAndUpdate(
      { _id: req.params.story_id },
      { title: req.body.title, description: req.body.description },
      { new: true },
      (err, story) => {
        if (err) console.log(err);
        else {
          req.flash('success', `Story "${story.title}" was updated!`);
          res.redirect('/author/' + req.user.author.id);
        }
      }
    );
});

router.delete('/:story_id', ensureAuthenticated, (req, res) => {
  Story
    .findByIdAndRemove(req.params.story_id, (err, storyRemoved) => {
      if (err) {
        console.log(err);
        return res.redirect('/author/' + req.user.author.id);
      } else {
        storyRemoved.chapters.forEach(chapter => {
          Chapter
            .findByIdAndDelete(chapter, err => {
              if (err) {
                console.log(err);
                return res.redirect('/author/' + req.user.author.id);
              }
            });
        });
        storyRemoved.reviews.forEach(review => {
          Review
            .findByIdAndDelete(review, err => {
              if (err) {
                console.log(err);
                return res.redirect('/author/' + req.user.author.id);
              }
            });
        });
        Author
          .findById(req.user.author.id, '_id stories', (err, author) => {
            if (err) {
              console.log(err);
              return res.redirect('/author/' + req.user.author.id);
            } else {
              author.stories.splice(author.stories.indexOf(storyRemoved._id), 1);
              Author
                .findOneAndUpdate({ _id: author._id }, { stories: author.stories }, err => {
                  if (err) console.log(err);
                  else {
                    req.flash('success', `Story ${storyRemoved.title} was removed!`);
                    res.redirect('/author/' + req.user.author.id);
                  }
                });
            }
          });
      }
    });
});

module.exports = router;