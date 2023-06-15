const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} = require('../controllers/users');

router.route('/').get(getAllUsers);
router.route('/:email').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;
