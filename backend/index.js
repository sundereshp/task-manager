const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;

// In-memory storage
let projects = [];

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Test endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the Node.js server!' });
});

// Get all projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// Add new project
app.post('/api/projects', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const newProject = {
      id: uuidv4(),
      name,
      tasks: [],
      createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project
app.put('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects[projectIndex].name = name;
    res.json(projects[projectIndex]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Duplicate a project
app.post('/api/projects/:projectId/duplicate', (req, res) => {
  try {
    const { projectId } = req.params;
    const original = projects.find(p => p.id === projectId);
    if (!original) return res.status(404).json({ error: 'Project not found' });

    const deepClonedTasks = JSON.parse(JSON.stringify(original.tasks));

    const newProject = {
      id: uuidv4(),
      name: `Copy of ${original.name}`,
      tasks: deepClonedTasks,
      createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error duplicating project:', error);
    res.status(500).json({ error: 'Failed to duplicate project' });
  }
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });

    projects.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Add a new task
app.post('/api/projects/:projectId/tasks', (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, assignee, dueDate, priority, status, comments } = req.body;
    const project = projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const newTask = {
      id: uuidv4(),
      name,
      assignee,
      dueDate, 
      priority,
      status,
      comments,
      subtasks: [],
      expanded: true,
      createdAt: new Date().toISOString()
    };

    project.tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.patch('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  const { projectId, taskId } = req.params;
  const updates = req.body;

  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  Object.assign(task, updates);
  return res.status(200).json({ message: 'Task updated', task });
});

// Delete task
app.delete('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const project = projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const index = project.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    project.tasks.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Add subtask
app.post('/api/projects/:projectId/tasks/:taskId/subtasks', (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { name, assignee, dueDate, priority, status, comments } = req.body;

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newSubtask = {
      id: uuidv4(),
      name: name || '',
      assignee: assignee || '',
      dueDate: dueDate || '',
      priority: priority || '',
      status: status || 'Not Started',
      comments: comments || '',
      actionItems: [],
      expanded: true,
      createdAt: new Date().toISOString()
    };

    task.subtasks = task.subtasks || [];
    task.subtasks.push(newSubtask);

    res.status(201).json(newSubtask);
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

// Update subtask
app.patch('/api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId', (req, res) => {
  const { projectId, taskId, subtaskId } = req.params;
  const updates = req.body;

  const project = projects.find(p => p.id === projectId);
  const task = project?.tasks.find(t => t.id === taskId);
  const subtask = task?.subtasks.find(st => st.id === subtaskId);

  if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

  Object.assign(subtask, updates);
  return res.status(200).json({ message: 'Subtask updated successfully', subtask });
});

// Delete subtask
app.delete('/api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId', (req, res) => {
  try {
    const { projectId, taskId, subtaskId } = req.params;
    const project = projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex === -1) return res.status(404).json({ error: 'Subtask not found' });

    // Remove the subtask and all its action items
    task.subtasks.splice(subtaskIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

// Delete action item
app.delete('/api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId/actionItems/:actionItemId', (req, res) => {
  try {
    const { projectId, taskId, subtaskId, actionItemId } = req.params;

    const project = projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

    const actionItemIndex = subtask.actionItems.findIndex(ai => ai.id === actionItemId);
    if (actionItemIndex === -1) return res.status(404).json({ error: 'Action item not found' });

    subtask.actionItems.splice(actionItemIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting action item:', error);
    res.status(500).json({ error: 'Failed to delete action item' });
  }
});

// Add action item
app.post('/api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId/actionItems', (req, res) => {
  try {
    const { projectId, taskId, subtaskId } = req.params;
    const { name } = req.body;

    const project = projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

    const newActionItem = {
      id: uuidv4(),
      name,
      assignee: null,
      dueDate: null,
      priority: 'normal',
      status: 'todo',
      comments: '',
      estimatedTime: null,
      timeSpent: 0,
      createdAt: new Date().toISOString()
    };

    subtask.actionItems = subtask.actionItems || [];
    subtask.actionItems.push(newActionItem);

    res.status(201).json(newActionItem);
  } catch (error) {
    console.error('Error adding action item:', error);
    res.status(500).json({ error: 'Failed to add action item' });
  }
});

// Update action item
app.patch('/api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId/actionItems/:actionItemId', (req, res) => {
  const { projectId, taskId, subtaskId, actionItemId } = req.params;
  const updates = req.body;

  const project = projects.find(p => p.id === projectId);
  const task = project?.tasks.find(t => t.id === taskId);
  const subtask = task?.subtasks.find(st => st.id === subtaskId);
  const actionItem = subtask?.actionItems.find(ai => ai.id === actionItemId);

  if (!actionItem) return res.status(404).json({ message: 'Action item not found' });

  Object.assign(actionItem, updates);
  return res.status(200).json({ message: 'Action item updated', actionItem });
});

// Initial test project
projects = [
  {
    id: uuidv4(),
    name: "Website Redesign",
    tasks: [
      {
        id: uuidv4(),
        name: "Design Phase",
        assignee: "1",
        dueDate: new Date().toISOString(),
        priority: "medium",
        status: "todo",
        comments: "",
        subtasks: [
          {
            id: uuidv4(),
            name: "Wireframes",
            assignee: "2",
            dueDate: null,
            priority: "medium",
            status: "todo",
            comments: "",
            actionItems: [
              {
                id: uuidv4(),
                name: "Create homepage wireframe",
                assignee: "2",
                dueDate: null,
                priority: "medium",
                status: "todo",
                comments: ""
              }
            ]
          }
        ]
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
