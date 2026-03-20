import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <Link className="brand" to="/">EventHub</Link>
      <nav className="nav-links">
        <NavLink to="/">Events</NavLink>
        {user && <NavLink to="/bookings">My Bookings</NavLink>}
        {user && <NavLink to="/notifications">My Notifications</NavLink>}
        {user && ['organizer', 'admin'].includes(user.role) && <NavLink to="/organizer/events">Manage Events</NavLink>}
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register">Register</NavLink>}
        {user && <button className="link-button" onClick={logout}>Logout</button>}
      </nav>
    </header>
  );
};

export default NavBar;
