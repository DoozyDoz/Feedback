const express = require('express');
const router = express.Router();

const {
  getAllFeedback,
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  editFeedback,
} = require('../controllers/feedback');

router.route('/').get(getAllFeedback).post(createFeedback);
router.route('/:id').get(getFeedback).patch(updateFeedback).delete(deleteFeedback);

module.exports = router;
