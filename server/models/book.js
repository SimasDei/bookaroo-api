const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    review: {
      type: String,
      required: true
    },
    pages: {
      type: String,
      default: 'Pages not set'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    price: {
      type: String,
      default: 'Price not set'
    },
    imageUrl: {
      type: String,
      default:
        'https://read.macmillan.com/wp-content/uploads/2016/04/book-cover-placeholder.png'
    },
    ownerId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = { Book };
