import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function TaskCard({ task }) {
  return (
    <Link to={`/tasks/${task._id || task.id}`} className="task-card">
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <span className={`badge badge-priority-${task.priority}`}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
      </div>
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}
      <div className="task-card-footer">
        <span className={`badge badge-status-${task.status}`}>
          {STATUS_LABELS[task.status] || task.status}
        </span>
      </div>
    </Link>
  );
}

export default TaskCard;
