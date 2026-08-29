require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Person = require('../models/Person');
const Expense = require('../models/Expense');

const seedData = async () => {
  try {
    console.log('[Seed]: Clearing existing data...');
    await Promise.all([
      Category.deleteMany({}),
      Subcategory.deleteMany({}),
      Person.deleteMany({}),
      Expense.deleteMany({}),
    ]);

    console.log('[Seed]: Creating Categories...');
    const categories = await Category.insertMany([
      {
        name: 'Electricity',
        color: '#F59E0B',
        icon: 'Zap',
        isDefault: true,
      },
      {
        name: 'Milk',
        color: '#0EA5E9',
        icon: 'Droplets',
        isDefault: true,
      },
      {
        name: 'Groceries / Food',
        color: '#22C55E',
        icon: 'ShoppingCart',
        isDefault: true,
      },
      {
        name: 'Other',
        color: '#8B5CF6',
        icon: 'Layers',
        isDefault: true,
      },
    ]);

    const catMap = {};
    categories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    console.log('[Seed]: Creating Subcategories...');
    const subcategories = await Subcategory.insertMany([
      // Electricity
      { name: 'Electricity Bill', categoryId: catMap['Electricity'] },
      { name: 'Power Backup & Inverter', categoryId: catMap['Electricity'] },

      // Milk
      { name: 'Morning Milk', categoryId: catMap['Milk'] },
      { name: 'Evening Milk', categoryId: catMap['Milk'] },
      { name: 'Dairy & Curd', categoryId: catMap['Milk'] },

      // Groceries / Food
      { name: 'Supermarket Groceries', categoryId: catMap['Groceries / Food'] },
      { name: 'Fresh Vegetables', categoryId: catMap['Groceries / Food'] },
      { name: 'Fruits & Dry Fruits', categoryId: catMap['Groceries / Food'] },
      { name: 'Dining Out & Snacks', categoryId: catMap['Groceries / Food'] },

      // Other
      { name: 'Internet & WiFi', categoryId: catMap['Other'] },
      { name: 'Home Repairs & Maintenance', categoryId: catMap['Other'] },
      { name: 'Miscellaneous', categoryId: catMap['Other'] },
    ]);

    const subMap = {};
    subcategories.forEach((s) => {
      subMap[s.name] = s._id;
    });

    console.log('[Seed]: Creating People ("whose money")...');
    const people = await Person.insertMany([
      { name: 'Common / Shared', isDefault: true },
      { name: 'Father', isDefault: false },
      { name: 'Mother', isDefault: false },
      { name: 'Self', isDefault: false },
    ]);

    const personMap = {};
    people.forEach((p) => {
      personMap[p.name] = p._id;
    });

    console.log('[Seed]: Generating realistic 90-day expenses...');
    const sampleExpenses = [];
    const now = new Date();

    // Generate daily/weekly expenses across the past 90 days
    for (let d = 89; d >= 0; d--) {
      const entryDate = new Date(now);
      entryDate.setDate(entryDate.getDate() - d);
      // Randomize hour within daytime
      entryDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

      // 1. Daily Morning Milk (almost everyday)
      if (Math.random() > 0.1) {
        sampleExpenses.push({
          amount: parseFloat((4.5 + Math.random() * 2).toFixed(2)),
          date: new Date(entryDate),
          categoryId: catMap['Milk'],
          subcategoryId: subMap['Morning Milk'],
          personId: personMap['Mother'],
          note: 'Morning fresh 2L milk packet',
        });
      }

      // 2. Evening Milk (every other day)
      if (d % 2 === 0) {
        sampleExpenses.push({
          amount: parseFloat((3.0 + Math.random() * 1.5).toFixed(2)),
          date: new Date(entryDate),
          categoryId: catMap['Milk'],
          subcategoryId: subMap['Evening Milk'],
          personId: personMap['Common / Shared'],
          note: 'Evening tea milk & yogurt',
        });
      }

      // 3. Vegetables & Fruits every 3 days
      if (d % 3 === 0) {
        sampleExpenses.push({
          amount: parseFloat((18 + Math.random() * 22).toFixed(2)),
          date: new Date(entryDate),
          categoryId: catMap['Groceries / Food'],
          subcategoryId: subMap['Fresh Vegetables'],
          personId: personMap['Father'],
          note: 'Weekly local vegetable farmers market',
        });
      }

      // 4. Weekly major groceries (every 7 days)
      if (d % 7 === 0) {
        sampleExpenses.push({
          amount: parseFloat((85 + Math.random() * 65).toFixed(2)),
          date: new Date(entryDate),
          categoryId: catMap['Groceries / Food'],
          subcategoryId: subMap['Supermarket Groceries'],
          personId: personMap['Self'],
          note: 'Weekly supermarket supplies & essentials',
        });
      }

      // 5. Dining out / Snacks every 5 days
      if (d % 5 === 2) {
        sampleExpenses.push({
          amount: parseFloat((25 + Math.random() * 35).toFixed(2)),
          date: new Date(entryDate),
          categoryId: catMap['Groceries / Food'],
          subcategoryId: subMap['Dining Out & Snacks'],
          personId: personMap['Self'],
          note: 'Weekend family dinner & bakery snacks',
        });
      }

      // 6. Monthly Electricity bill (around every 30 days)
      if (d === 80 || d === 50 || d === 20) {
        sampleExpenses.push({
          amount: parseFloat((110 + Math.random() * 40).toFixed(2)),
          date: new Date(entryDate),
          categoryId: catMap['Electricity'],
          subcategoryId: subMap['Electricity Bill'],
          personId: personMap['Common / Shared'],
          note: 'Monthly power utility bill payment',
        });
      }

      // 7. Monthly Internet & Miscellaneous
      if (d === 75 || d === 45 || d === 15) {
        sampleExpenses.push({
          amount: 59.99,
          date: new Date(entryDate),
          categoryId: catMap['Other'],
          subcategoryId: subMap['Internet & WiFi'],
          personId: personMap['Self'],
          note: 'High-speed fiber internet subscription',
        });
      }

      // 8. Occasional repairs / Home care (every 18 days)
      if (d % 18 === 4) {
        sampleExpenses.push({
          amount: parseFloat((35 + Math.random() * 45).toFixed(2)),
          date: new Date(entryDate),
          categoryId: catMap['Other'],
          subcategoryId: subMap['Home Repairs & Maintenance'],
          personId: personMap['Father'],
          note: 'Plumbing and home hardware supplies',
        });
      }
    }

    await Expense.insertMany(sampleExpenses);
    console.log(`[Seed]: Seeded ${categories.length} categories, ${subcategories.length} subcategories, ${people.length} people, and ${sampleExpenses.length} expenses successfully!`);
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

const checkAndAutoSeed = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    console.log('[AutoSeed]: Empty database detected. Running initial seed...');
    // await seedData();
  } else {
    console.log(`[Database Ready]: Found ${count} categories.`);
  }
};

// If run directly from terminal: node seeds/seed.js
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedData();
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = {
  seedData,
  checkAndAutoSeed,
};
