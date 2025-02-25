const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', todoController.getAllTodos);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

router.get('/date/:date', todoController.getTodosByDate);
router.get('/priority/:priority', todoController.getTodosByPriority);
router.get('/stats', todoController.getTodoStats);

module.exports = router; 