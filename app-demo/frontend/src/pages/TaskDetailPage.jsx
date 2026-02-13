import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import TaskForm from '../components/TaskForm';

function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTask = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/tasks/${id}`);
      setTask(data.task || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleUpdate = async (taskData) => {
    try {
      await api.put(`/api/tasks/${id}`, taskData);
      setEditing(false);
      fetchTask();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.del(`/api/tasks/${id}`);
      navigate('/tasks');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading task...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <Link to="/tasks" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  if (!task) return null;

  const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
  const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

  return (
    <div className="container">
      <Link to="/tasks" className="back-link">Back to Dashboard</Link>

      {editing ? (
        <div className="card">
          <h2>Edit Task</h2>
          <TaskForm
            task={task}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="card task-detail">
          <div className="task-detail-header">
            <h1>{task.title}</h1>
            <div className="task-detail-actions">
              <button className="btn btn-primary" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>

          <div className="task-detail-meta">
            <span className={`badge badge-status-${task.status}`}>
              {STATUS_LABELS[task.status] || task.status}
            </span>
            <span className={`badge badge-priority-${task.priority}`}>
              {PRIORITY_LABELS[task.priority] || task.priority}
            </span>
          </div>

          {task.description && (
            <div className="task-detail-body">
              <h3>Description</h3>
              <p>{task.description}</p>
            </div>
          )}

          {task.createdAt && (
            <div className="task-detail-date">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskDetailPage;
