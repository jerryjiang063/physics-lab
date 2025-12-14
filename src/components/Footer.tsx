import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      marginTop: '40px',
      padding: '20px',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
      borderTop: '1px solid #e0e0e0',
    }}>
      <a
        href="https://spyccb.top"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#667eea',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = 'underline';
          e.currentTarget.style.color = '#764ba2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = 'none';
          e.currentTarget.style.color = '#667eea';
        }}
      >
        By Jerry Jiang
      </a>
    </footer>
  );
};

export default Footer;

