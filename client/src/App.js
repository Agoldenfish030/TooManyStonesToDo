import './App.css';

const authenticationSuccess = function() {
  const token = window.Trello.token();
  sessionStorage.setItem({'trelloToken': token});
  console.log('Successful authentication');
};

const authenticationFailure = function() {
  console.log('Failed authentication');
};

function App() {
  const handleLogin = ()=>{
      window.Trello.authorize({
      type: 'popup',
      name: 'Getting Started Application',
      scope: {
        read: 'true',
        write: 'true' },
      expiration: 'never',
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
    </div>
  );
}

export default App;
