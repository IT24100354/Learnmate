const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('ADMIN', 'TEACHER'), getUsers);

router.route('/:id')
  .get(getUserById)
  .put(authorize('ADMIN'), updateUser)
  .delete(authorize('ADMIN'), deleteUser);

module.exports = router;
