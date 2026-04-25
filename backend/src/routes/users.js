const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getStudents, getTeachers } = require('../controllers/usersController');
const router = express.Router();

router.use(authenticate);
router.get('/', authorize('admin'), getAllUsers);
router.get('/students', authorize('admin', 'teacher'), getStudents);
router.get('/teachers', authorize('admin'), getTeachers);
router.get('/:id', authorize('admin'), getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
