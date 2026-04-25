const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);

