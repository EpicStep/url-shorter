const mongoose = require('mongoose');

const { Schema } = mongoose;

const shortSchema = new Schema({
  shorted: {
    type: String,
    index: true,
    unique: true,
  },
  original: String,
}, {
  versionKey: false,
});

const Short = mongoose.model('short', shortSchema);

module.exports = Short;
