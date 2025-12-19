import './App.css';

const authenticationSuccess = async function() {
  const token = window.Trello.token();
  try{
    const response = await fetch('https://toomuchstonestodo.onrender.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    })
    if(!response.ok) console.error("存入token失敗");
  }catch(err){
    console.error("存入token失敗：", err);
  }
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
