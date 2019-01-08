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

// Authorization Middleware
const { auth } = require('./middleWare/auth');

// -- BOOK ROUTES -- //

//@Get
//@single
//@localhost:5000/api/getBook?id=
app.get('/api/getBook', (req, res) => {
  let id = req.query.id;

  Book.findById(id, (err, doc) => {
    if (err) return res.status(400).send(err);

    res.send(doc);
  });
});

//@get
//@All Skip Sort And Order
//@localhost:5000/api/books?skip=0&limit=5&sort=asc
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

//@post
//@New Book
//@localhost:5000/api/book
app.post('/api/book', (req, res) => {
  const book = new Book(req.body);
  book.save((err, doc) => {
    if (err) return res.status(400).send(err);

    res.status(200).json({
      post: true,
      bookId: doc._id
    });
  });
});

//@post
//@Update Book
//@localhost:5000/api/book_update
app.post('/api/book_update', (req, res) => {
  Book.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.json({
      success: true,
      doc
    });
  });
});

//@Delete
//@Delete book
//@localhost:5000/api/delete_book?id=
app.delete('/api/delete_book', (req, res) => {
  let id = req.query.id;

  Book.findByIdAndDelete(id, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.json(true);
  });
});

// -- USER ROUTES -- //

//@get
//@Authenticate User or Redirect
//@localhost:5000/api/auth
app.get('/api/auth', auth, (req, res) => {
  res.json({
    isAuth: true,
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    lastName: req.user.lastName
  });
});

//@post
//@Create a User
//@localhost:5000/api/register
app.post('/api/register', (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false });
    res.status(200).json({
      success: true,
      user: doc
    });
  });
});

//@post
//@Log User In
//@localhost:5000/api/login
app.post('/api/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        isAuth: false,
        message: 'User with such Email was not found.'
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          isAuth: false,
          message: 'Incorrect Password'
        });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        res.cookie('auth', user.token).json({
          isAuth: true,
          id: user._id,
          email: user.email
        });
      });
    });
  });
});

//@get
//@Log user Out
//@localhost:5000/api/logout
app.get('/api/logout', auth, (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return res.status(400).send(err);
    res.sendStatus(200);
  });
});

//@get
//@Get Reviewer
//@localhost:5000/api/getReviewer
app.get('/api/getReviewer', (req, res) => {
  let id = req.query.id;

  User.findById(id, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.json({
      name: doc.name,
      lastName: doc.lastName
    });
  });
});

//@get
//Get Users
//@localhost:5000/api/users
app.get('/api/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(users);
  });
});

//@get
//@Get user posts and reviews
//@localhost:5000/api/user_posts?user=
app.get('/api/user_posts', (req, res) => {
  Book.find({ ownerId: req.query.user }).exec((err, doc) => {
    if (err) return res.status(400).send(err);
    res.send(doc);
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Server running, Captain o/');
});
