const Todo = require('../models/Todo');

// Get all todos for a user
exports.getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
};

// Create a new todo
exports.createTodo = async (req, res) => {
  try {
    const todo = await Todo.create({
      ...req.body,
      userId: req.userId,
      status: 'pending'
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo' });
  }
};

// Update a todo
exports.updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo' });
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
};

// Get todos by date
exports.getTodosByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const todos = await Todo.find({
      userId: req.userId,
      dueDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ createdAt: -1 });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos by date' });
  }
};

// Get todos by priority
exports.getTodosByPriority = async (req, res) => {
  try {
    const todos = await Todo.find({
      userId: req.userId,
      priority: req.params.priority
    }).sort({ createdAt: -1 });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos by priority' });
  }
};

// Get todo statistics
exports.getTodoStats = async (req, res) => {
  try {
    const stats = await Todo.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      highPriority: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todo statistics' });
  }
}; 