const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('../api/categories/category.model');

const userId = ''; // Example user _id

const categories = [
    { name: 'Housing', type: 'expense', userId },
    { name: 'Food', type: 'expense', userId },
    { name: 'Transport', type: 'expense', userId },
    { name: 'Entertainment', type: 'expense', userId },
    { name: 'Utilities', type: 'expense', userId },
    { name: 'Healthcare', type: 'expense', userId },
    { name: 'Shopping', type: 'expense', userId },
    { name: 'Other', type: 'expense', userId },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    await Category.deleteMany({ userId }); // Optional: clear old categories for this user
    await Category.insertMany(categories);
    console.log('Categories seeded!');
    mongoose.disconnect();
}

seed(); 