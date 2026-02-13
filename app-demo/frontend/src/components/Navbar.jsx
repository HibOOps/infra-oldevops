import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/tasks" className="navbar-brand">
          Task Manager
        </Link>
        <div className="navbar-right">
          {user && <span className="navbar-greeting">Hello, {user.name}</span>}
          <button className="btn btn-outline" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
