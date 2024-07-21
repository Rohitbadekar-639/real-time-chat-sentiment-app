import React from 'react';

function Message({ message }) {
  const getSentimentColor = (sentiment) => {
    if (sentiment > 0) return 'green';
    if (sentiment < 0) return 'red';
    return 'gray';
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <span>{message.text}</span>
      <span 
        style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: getSentimentColor(message.sentiment),
          marginLeft: '5px'
        }}
      ></span>
    </div>
  );
}

export default Message;