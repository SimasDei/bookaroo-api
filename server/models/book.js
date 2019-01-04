const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    author: { type: String, required: true },
    review: { type: String, default: 'No Reviews' },
    pages: { type: String, default: 'Pages not available' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    price: { type: String, default: 'Price not available' },
    ownerId: { type: String, required: true }
  },
  { timestamps: true }
);

const Book = mongoose.Model('Book', bookSchema);

module.exports = { Book };
