import { useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const destinations = [
  { to: '/admin/dashboard', label: 'Properties' },
  { to: '/admin/manage-all?tab=users', label: 'Users' },
  { to: '/admin/upload-history', label: 'Upload History' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/', label: 'Main Site' },
];

export function AdminNavigation() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const id = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const closeOnEscape = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
      toggle.current?.focus();
    }
  };

  return <>
    <button ref={toggle} type="button" className="admin-nav-toggle"
      aria-label="Admin menu" aria-expanded={open} aria-controls={id}
      onClick={() => setOpen(!open)} onKeyDown={closeOnEscape}>
      {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}<span>Menu</span>
    </button>
    <nav id={id} className={`admin-cockpit-nav${open ? ' is-open' : ''}`}
      aria-label="Admin navigation" onKeyDown={closeOnEscape}>
      {destinations.map(({ to, label }) => {
        const active = pathname === to.split('?')[0] || (to === '/admin/dashboard' && pathname === '/admin');
        return <Link key={to} to={to} className={active ? 'active' : ''}
          aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>;
      })}
    </nav>
  </>;
}
