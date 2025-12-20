import './App.css';
import { getBoards } from './trelloI/getBoards';

const authenticationSuccess = function() {
  console.log('Successful authentication');
};

const authenticationFailure = function() {
  console.log('Failed authentication');
};

function App() {
  const handleLogin = ()=>{
      window.Trello.authorize({
      type: 'popup',
      name: 'TooMuchStonesToDo_power-up',
      scope: {
        read: 'true',
        write: 'true' },
      expiration: '1hour',
      success: authenticationSuccess,
      error: authenticationFailure
    });
  }
  
  return (
    <div className="App">
      <h1>Welcome</h1>
      <button onClick={handleLogin}>
        點我使用該死的授權
      </button>
      <br />
      <button onClick={getBoards}>
        getBoards
      </button>
      <div></div>
    </div>
  );
}

export default App;
