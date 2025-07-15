"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const Category = (0, mongoose_1.model)('Category', categorySchema);
exports.default = Category;
