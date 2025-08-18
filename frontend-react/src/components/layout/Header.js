import { Link } from 'react-router-dom';

function Header() {
  return (
    <nav>
      <ul>
        <li><Link to="/polls">Polls</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/admin/results/">Results</Link></li>
      </ul>
    </nav>
  );
}

export default Header;