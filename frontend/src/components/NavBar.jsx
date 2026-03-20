import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOrganizerOrAdmin = ['organizer', 'admin'].includes(user?.role);

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link className="brand" to={isAdmin ? '/organizer/events' : '/'}>
          <span className="brand__mark">EH</span>
          <span>
            <strong>EventHub</strong>
            <small>Curated event operations platform</small>
          </span>
        </Link>

        <nav className="nav-links">
          {!user && <NavLink to="/">Discover</NavLink>}
          {user && !isAdmin && <NavLink to="/">Discover</NavLink>}
          {user && !isAdmin && <NavLink to="/bookings">Bookings</NavLink>}
          {user && <NavLink to="/notifications">Alerts</NavLink>}
          {user && isOrganizerOrAdmin && <NavLink to="/organizer/events">Control Room</NavLink>}
        </nav>

        <div className="topbar__actions">
          {user ? (
            <>
              <div className="user-pill">
                <span className="user-pill__name">{user.name}</span>
                <span className="user-pill__meta">{user.role}</span>
              </div>
              <button className="button button--ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink className="button button--ghost" to="/login">Login</NavLink>
              <NavLink className="button" to="/register">Create account</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
