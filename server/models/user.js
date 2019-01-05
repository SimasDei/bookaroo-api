const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);

const SALT = 10;

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    required: true,
    minLength: 4
  },
  name: {
    type: String,
    maxLength: 100
  },
  lastName: {
    type: String,
    maxLength: 100
  },
  role: {
    type: Number,
    default: 0
  },
  token: {
    type: String
  }
});

userSchema.pre('save', function(next) {
  let user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(SALT, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function(cb) {
  let user = this;
  let token = jwt.sign(user._id.toHexString(), config.SECRET);

  user.token = token;

  user.save((err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

// Find user by token in cookies
userSchema.statics.findByToken = function(token, cb) {
  let user = this;

  jwt.verify(token, config.SECRET, function(err, decode) {
    // prettier-ignore
    user.findOne({ "_id": decode, "token": token }, function(err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

// Delete user token for logout
userSchema.methods.deleteToken = function(token, cb) {
  let user = this;

  user.update({ $unset: { token: 1 } }, (err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
