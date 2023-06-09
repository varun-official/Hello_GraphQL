/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Book", bookSchema, "book");
