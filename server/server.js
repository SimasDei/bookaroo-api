const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(
  config.DATABASE,
  { useNewUrlParser: true },
  console.log('Connection to the Database Established, Captain! o/')
);
mongoose.set('useCreateIndex', true);

// Import Models
const { User } = require('./models/user');
const { Book } = require('./models/book');

// GET Routes

// BOOK
// single
app.get('/api/getBook', (req, res) => {
  let id = req.query.id;

  Book.findById(id, (err, doc) => {
    if (err) return res.status(400).send(err);

    res.send(doc);
  });
});

// All
// Skip Sort And Order
// localhost:3001/api/books?skip=0&limit=5&sort=asc
app.get('/api/books', (req, res) => {
  let skip = parseInt(req.query.skip);
  let limit = parseInt(req.query.limit);
  let order = req.query.order;

  Book.find()
    .skip(skip)
    .sort({ _id: order })
    .limit(limit)
    .exec((err, doc) => {
      if (err) return res.status(400).send(err);
      res.send(doc);
    });
});

// POST Routes

// BOOK
app.post('/api/book', (req, res) => {
  const book = new Book(req.body);
  book.save((err, doc) => {
    // if (err) return res.status(400).send(err);

    res.status(200).json({
      post: true,
      bookId: doc._id
    });
  });
});

// UPDATE Routes

// BOOK
app.post('/api/book_update', (req, res) => {
  Book.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.json({
      success: true,
      doc
    });
  });
});

// DELETE Routes

// BOOK
app.delete('/api/delete_book', (req, res) => {
  let id = req.query.id;

  Book.findByIdAndDelete(id, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.json(true);
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log('Server running, Captain o/');
});
