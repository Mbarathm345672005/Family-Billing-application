const express = require('express');
const router = express.Router();
const {
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
} = require('../controllers/personController');
const { personRules, mongoIdParamRule } = require('../middleware/validator');

router.route('/')
  .get(getPeople)
  .post(personRules, createPerson);

router.route('/:id')
  .put(mongoIdParamRule, updatePerson)
  .delete(mongoIdParamRule, deletePerson);

module.exports = router;
