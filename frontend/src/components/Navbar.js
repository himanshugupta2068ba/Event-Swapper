import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navStyle = {
    background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
    color: 'white',
    padding: '15px 0',
    marginBottom: '20px',
    boxShadow: '0 4px 20px rgba(106, 17, 203, 0.4)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    position: 'relative',
    transition: 'all 0.3s ease',
  };

  const linkHover = {
    ...linkStyle,
    textShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
  };

  return (
    <nav style={navStyle}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '22px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textShadow: '0 0 10px rgba(255,255,255,0.4)',
            transition: 'transform 0.3s ease, text-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.textShadow = '0 0 20px rgba(255,255,255,0.8)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.textShadow = '0 0 10px rgba(255,255,255,0.4)';
          }}
        >
          SlotSwapper
        </Link>

        {user && (
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <span style={{ fontWeight: '500' }}>Hello, {user.name}</span>

            {['Dashboard', 'Marketplace', 'Requests'].map((page, i) => (
              <Link
                key={i}
                to={`/${page.toLowerCase()}`}
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ffccff';
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.textShadow = '0 0 12px rgba(255,255,255,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.textShadow = 'none';
                }}
              >
                {page}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 20px',
                border: 'none',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #a4508b, #5f0a87)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 0 12px rgba(164, 80, 139, 0.5)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 18px rgba(164, 80, 139, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 12px rgba(164, 80, 139, 0.5)';
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
