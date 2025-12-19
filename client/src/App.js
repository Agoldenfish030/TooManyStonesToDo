import './App.css';
import { useEffect } from 'react';

const authenticationSuccess = function() {
  console.log('Successful authentication');
};

const authenticationFailure = function() {
  console.log('Failed authentication');
};

const handleLogin = ()=>{
  window.Trello.authorize({
    type: 'popup',
    name: 'TooMuchStonesToDo_power-up',
    scope: {
      read: 'true',
      write: 'true' },
    expiration: 'never',
    success: authenticationSuccess,
    error: authenticationFailure
  });
}

function App() {
  useEffect(()=>{
    const script = document.createElement('script');
    script.src = `https://trello.com/1/client.js?key=${process.env.MY_API_KEY}`;
    document.head.appendChild(script);
  });
  
  return (
    <div className="App">
      <h1>Welcome</h1>
      <button onClick={handleLogin}>
        點我使用該死的授權
      </button>
    </div>
  );
}

export default App;
