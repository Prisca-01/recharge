import { NavLink } from 'react-router-dom';
import './NavBar.css';

const BoltIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" fill="currentColor"/>
  </svg>
);

const TimerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <circle cx="12" cy="13" r="8"/>
    <path d="M12 9v4l2.5 2.5"/>
    <path d="M9.5 3h5"/>
    <path d="M12 3v2"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <rect x="3" y="12" width="4" height="9" rx="1"/>
    <rect x="10" y="7" width="4" height="14" rx="1"/>
    <rect x="17" y="3" width="4" height="18" rx="1"/>
  </svg>
);

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

const navItems = [
  { to: '/', label: 'Focus', icon: <TimerIcon /> },
  { to: '/stats', label: 'Stats', icon: <ChartIcon /> },
  { to: '/settings', label: 'Settings', icon: <GearIcon /> },
];

export function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <BoltIcon />
      </div>
      <ul className="navbar-links">
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
