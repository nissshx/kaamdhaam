'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ChevronRightIcon, TrashIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/solid';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState({});
  const [finishedTasks, setFinishedTasks] = useState({});
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [moveTaskMenu, setMoveTaskMenu] = useState({ open: false, task: null, column: null });

  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedTasks = localStorage.getItem('tasks');
    const savedFinishedTasks = localStorage.getItem('finishedTasks');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedFinishedTasks) setFinishedTasks(JSON.parse(savedFinishedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('finishedTasks', JSON.stringify(finishedTasks));
  }, [projects, tasks, finishedTasks]);

  const createNewProject = () => {
    if (newProjectName) {
      const updatedProjects = [...projects, newProjectName];
      setProjects(updatedProjects);
      setTasks(prevTasks => ({
        ...prevTasks,
        [newProjectName]: { Backlog: [], 'In Progress': [], Testing: [], Done: [] }
      }));
      setFinishedTasks(prevFinishedTasks => ({
        ...prevFinishedTasks,
        [newProjectName]: []
      }));
      setNewProjectName('');
      setIsNewProjectDialogOpen(false);
      setCurrentProject(newProjectName);
    }
  };

  const deleteProject = (projectToDelete) => {
    if (confirm(`Are you sure you want to delete the project "${projectToDelete}"?`)) {
      setProjects(projects.filter(project => project !== projectToDelete));
      setTasks(prevTasks => {
        const { [projectToDelete]: _, ...rest } = prevTasks;
        return rest;
      });
      setFinishedTasks(prevFinishedTasks => {
        const { [projectToDelete]: _, ...rest } = prevFinishedTasks;
        return rest;
      });
      if (currentProject === projectToDelete) {
        setCurrentProject(null);
      }
    }
  };

  const createNewTask = () => {
    if (newTaskName && currentProject) {
      const newTask = {
        name: newTaskName,
        timestamp: new Date().toISOString(),
      };
      setTasks(prevTasks => ({
        ...prevTasks,
        [currentProject]: {
          ...prevTasks[currentProject],
          Backlog: [...prevTasks[currentProject].Backlog, newTask],
        },
      }));
      setNewTaskName('');
      setIsNewTaskDialogOpen(false);
    }
  };

  const deleteTask = (taskToDelete, column) => {
    if (confirm(`Are you sure you want to delete the task "${taskToDelete.name}"?`)) {
      setTasks(prevTasks => ({
        ...prevTasks,
        [currentProject]: {
          ...prevTasks[currentProject],
          [column]: prevTasks[currentProject][column].filter(task => task.name !== taskToDelete.name),
        },
      }));
    }
  };

  const moveTask = (task, fromColumn, toColumn) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [currentProject]: {
        ...prevTasks[currentProject],
        [fromColumn]: prevTasks[currentProject][fromColumn].filter((t) => t.name !== task.name),
        [toColumn]: [...prevTasks[currentProject][toColumn], task],
      },
    }));
    setMoveTaskMenu({ open: false, task: null, column: null });
  };

  const finishTask = (task) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [currentProject]: {
        ...prevTasks[currentProject],
        Done: prevTasks[currentProject].Done.filter((t) => t.name !== task.name),
      },
    }));
    setFinishedTasks(prevFinishedTasks => ({
      ...prevFinishedTasks,
      [currentProject]: [...(prevFinishedTasks[currentProject] || []), { ...task, finishedAt: new Date().toISOString() }],
    }));
  };

  function getColumnStyle(column) {
    switch (column) {
      case 'Task Created':
        return { borderColor: '#4A5568' };
      case 'In Progress':
        return { borderColor: '#ED8936' };
      case 'Testing':
        return { borderColor: '#4299E1' };
      case 'Done':
        return { borderColor: '#48BB78' };
      default:
        return { borderColor: '#4A5568' };
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <Head>
        <title>KaamDhaam</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-2xl text-center text-gray-200">KaamDhaam /</h1>
      </header>

      <main className="flex">
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
          <div className="mb-4">
            <img
              src="https://via.placeholder.com/50"
              alt="User"
              className="w-12 h-12 inline-block mr-2"
            />
            <span className="text-gray-300">Hello Tanu</span>
          </div>
          <h2 className="text-xl mb-2 text-gray-200">Projects</h2>
          <ul>
            {projects.map((project, index) => (
              <li
                key={index}
                className={`cursor-pointer hover:bg-gray-700 p-2 flex justify-between items-center ${
                  currentProject === project ? 'bg-gray-700' : ''
                }`}
              >
                <span onClick={() => setCurrentProject(project)}>{project}</span>
                <TrashIcon
                  className="h-5 w-5 text-gray-500 hover:text-red-400 cursor-pointer"
                  onClick={() => deleteProject(project)}
                />
              </li>
            ))}
          </ul>
          <button
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4"
            onClick={() => setIsNewProjectDialogOpen(true)}
          >
            Create New Project
          </button>
        </aside>

        <section className="flex-grow p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl text-gray-200">
              {currentProject || 'SELECT/CREATE PROJECT TO CONTINUE'}
            </h2>
            {currentProject && (
              <button
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4"
                onClick={() => setIsNewTaskDialogOpen(true)}
              >
                Create New Task
              </button>
            )}
          </div>
          {currentProject && tasks[currentProject] && (
            <div className="flex space-x-4">
              {['Task Created', 'In Progress', 'Testing', 'Done'].map((column) => (
                <div key={column} className="flex-1 bg-gray-800 p-4 border-2" style={getColumnStyle(column)}>
                  <h3 className="text-lg mb-2 text-gray-200 font-semibold">{column}</h3>
                  <ul>
                    {tasks[currentProject][column === 'Task Created' ? 'Backlog' : column].map((task, index) => (
                      <li key={index} className="bg-gray-700 p-2 mb-2 border border-gray-600 flex justify-between items-center">
                        <div>
                          <span>{task.name}</span>
                          <div className="text-xs text-gray-400 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {new Date(task.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <ChevronRightIcon
                            className="h-5 w-5 cursor-pointer mr-2 text-gray-500 hover:text-gray-300"
                            onClick={() => setMoveTaskMenu({ open: true, task, column })}
                          />
                          {column === 'Done' && (
                            <CheckCircleIcon
                              className="h-5 w-5 text-gray-500 hover:text-green-400 cursor-pointer mr-2"
                              onClick={() => finishTask(task)}
                            />
                          )}
                          <TrashIcon
                            className="h-5 w-5 text-gray-500 hover:text-red-400 cursor-pointer"
                            onClick={() => deleteTask(task, column)}
                          />
                          {moveTaskMenu.open && moveTaskMenu.task.name === task.name && moveTaskMenu.column === column && (
                            <div className="absolute mt-2 w-48 bg-gray-800 shadow-lg">
                              {['Task Created', 'In Progress', 'Testing', 'Done'].filter(c => c !== column).map((targetColumn) => (
                                <button
                                  key={targetColumn}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                  onClick={() => moveTask(task, column === 'Task Created' ? 'Backlog' : column, targetColumn === 'Task Created' ? 'Backlog' : targetColumn)}
                                >
                                  Move to {targetColumn}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {currentProject && finishedTasks[currentProject] && finishedTasks[currentProject].length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg mb-2 text-gray-200">Finished Tasks</h3>
              <ul className="bg-gray-800 p-4 border border-gray-700">
                {finishedTasks[currentProject].map((task, index) => (
                  <li key={index} className="bg-gray-700 p-2 mb-2 border border-gray-600 flex justify-between items-center">
                    <div>
                      <span>{task.name}</span>
                      <div className="text-xs text-gray-400 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Created: {new Date(task.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Finished: {new Date(task.finishedAt).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      {isNewTaskDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4">
            <h2 className="text-lg mb-2 text-gray-200">Create New Task</h2>
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-gray-500"
              placeholder="Enter task name"
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 mr-2"
                onClick={createNewTask}
              >
                Create
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 px-4"
                onClick={() => setIsNewTaskDialogOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewProjectDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-200">Create New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-gray-500"
              placeholder="Enter project name"
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 mr-2"
                onClick={createNewProject}
              >
                Create
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 px-4"
                onClick={() => setIsNewProjectDialogOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}