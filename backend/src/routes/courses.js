const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/coursesController');
const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', authenticate, authorize('admin'), createCourse);
router.put('/:id', authenticate, authorize('admin'), updateCourse);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);

module.exports = router;
