const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income'],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const Category = model('Category', categorySchema);
module.exports = Category;