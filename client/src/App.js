import { useState, useEffect } from 'react';
import { ChevronDownIcon, CalendarIcon, PlusIcon, XIcon, Trash2Icon } from 'lucide-react';
import './App.css'; 
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'; 
import { db } from './firebaseConfig'; 

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: '',
    date: '',
    status: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      const taskCollection = collection(db, "tasks");
      const taskSnapshot = await getDocs(taskCollection);
      const taskList = taskSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(taskList);
    };

    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault(); 

    if (!newTask.title || !newTask.date) {
      setErrorMessage("Title and Date are required");
      return; 
    }

    try {
      const docRef = await addDoc(collection(db, "tasks"), { ...newTask, id: Date.now() });
      console.log("Task added with ID: ", docRef.id);

      setTasks((prev) => [...prev, { ...newTask, id: docRef.id }]);

      setIsModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: '',
        date: '',
        status: '',
      });
      setErrorMessage(''); 
    } catch (e) {
      console.error("Error adding task: ", e);
      setErrorMessage("Failed to create task. Please try again.");
    }
  };

  const changeStatus = async (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    const taskDoc = doc(db, "tasks", taskId);
    try {
      await updateDoc(taskDoc, { status: newStatus });
      console.log("Task status updated");
    } catch (e) {
      console.error("Error updating task: ", e);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const taskDoc = doc(db, "tasks", taskId);
    try {
      await deleteDoc(taskDoc);
      console.log("Task deleted");

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (e) {
      console.error("Error deleting task: ", e);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Desktop & Mobile Application</h1>
        <button onClick={() => setIsModalOpen(true)} className="create-btn">
          Create Task
        </button>
      </div>

      <div className="task-columns">
        {['TODO', 'IN PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className="task-column">
            <div className={`task-column-header ${status.toLowerCase()}`}>
              {status}
            </div>
            <div className="task-list">
              {tasks.filter(task => task.status === status).map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-card-header">
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <div className="dropdown">
                      <button className="dropdown-button">
                        <ChevronDownIcon className="icon" />
                      </button>
                      <div className="dropdown-menu">
                        <p>Change Status</p>

                        {['TODO', 'IN PROGRESS', 'COMPLETED'].map(newStatus => (
                          <button
                            key={newStatus}
                            onClick={() => changeStatus(task.id, newStatus)}
                            className="dropdown-item"
                          >
                            {newStatus}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div className="task-date">
                    <CalendarIcon className="icon" />
                    <span>{task.date}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task.id)} 
                    className="delete-btn">
                    <Trash2Icon className="icon" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <PlusIcon className="icon"
                 style={{backgroundColor:"#8a31e5", color:"#fff",borderRadius:"50%",padding:"2px"}}/>
                Create New Task
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <XIcon className="icon" />
              </button>
            </div>
            <div className="modal-body">
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <form onSubmit={handleCreateTask}>
                <label>
                <p>Title</p>
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    placeholder="Select here"
                    required
                  />
                </label>

                <label>
                <p>Description</p>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    placeholder="Add here"
                  />
                </label>

                <label>
                <p>Priority</p>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                >
                  <option value="" disabled selected>
                    Select here
                  </option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>


                <label>
                 <p>Date</p>
                  <input
                    type="date"
                    name="date"
                    value={newTask.date}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                <p>Status</p>
                  <select
                    name="status"
                    placeholder="Select here"
                    value={newTask.status}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled selected>
                    Select here
                    </option>
                    <option value="TODO">TODO</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </label>

                <button type="submit" className="submit-btn">
                  Create Task
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


