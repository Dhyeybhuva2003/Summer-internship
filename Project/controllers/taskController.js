const Task = require('../models/taskModel');
const io = require('../server').io;

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createTask = async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  try {
    // Check if required fields are provided
    if (!title || !description || !dueDate || !priority) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create the task
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      owner: req.user._id,
    });

    // Save the task to the database
    const createdTask = await task.save();

    // Emit the task update event
    if (io) {
      io.emit('taskUpdated', createdTask);
    } else {
      console.warn('io is not initialized, skipping WebSocket emission');
    }

    // Send the created task as a response
    res.status(201).json(createdTask);

  } catch (error) {
    console.error('Error creating task:', error.message); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};


const updateTask = async (req, res) => {
  const { title, description, status, dueDate, priority } = req.body;

  try {
    // Find the task by ID
    const task = await Task.findById(req.params.id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the user is authorized to update the task
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    // Update task fields if they are provided in the request body
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;

    // Save the updated task to the database
    const updatedTask = await task.save();

    // Emit the updated task via WebSocket, if available
    if (io) {
      io.emit('taskUpdated', updatedTask);
    } else {
      console.warn('io is not initialized, skipping WebSocket emission');
    }

    // Send the updated task as a response
    res.json(updatedTask);

  } catch (error) {
    console.error('Error updating task:', error.message); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.remove();
    io.emit('taskDeleted', task._id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
