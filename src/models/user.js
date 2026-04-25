const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

