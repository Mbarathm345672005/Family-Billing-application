const Person = require('../models/Person');
const Expense = require('../models/Expense');

// @desc    Get all people ("whose money")
// @route   GET /api/people
const getPeople = async (req, res, next) => {
  try {
    const people = await Person.find().sort({ isDefault: -1, name: 1 }).lean();
    res.json({
      success: true,
      count: people.length,
      data: people,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create person
// @route   POST /api/people
const createPerson = async (req, res, next) => {
  try {
    const { name, isDefault } = req.body;
    const person = await Person.create({
      name: name.trim(),
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({
      success: true,
      message: 'Person created successfully',
      data: person,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update person
// @route   PUT /api/people/:id
const updatePerson = async (req, res, next) => {
  try {
    const { name } = req.body;
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false, message: 'Person not found' });
    }

    if (name) person.name = name.trim();
    await person.save();

    res.json({
      success: true,
      message: 'Person updated successfully',
      data: person,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete person
// @route   DELETE /api/people/:id
const deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false, message: 'Person not found' });
    }

    const expenseCount = await Expense.countDocuments({ personId: person._id });
    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete person "${person.name}" because it is linked to ${expenseCount} existing expense records.`,
      });
    }

    await person.deleteOne();

    res.json({
      success: true,
      message: `Person "${person.name}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
};
