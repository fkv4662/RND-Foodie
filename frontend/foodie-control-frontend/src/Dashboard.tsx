import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the Foodie Control Dashboard!</p>
      <button
        onClick={() => {
          const token = localStorage.getItem('token');
          if (token) {
            // Open fridge.html with token in query string (since you can't set headers with window.location)
            window.location.href = `/fridge.html?token=${token}`;
          } else {
            alert('Not authenticated!');
          }
        }}
      >
        Rationale
      </button>
    </div>
  );
};

export default Dashboard;
