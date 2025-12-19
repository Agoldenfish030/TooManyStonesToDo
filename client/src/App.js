import './App.css';

function App() {
  const handleLogin = async()=>{
    try{
      const linkResponse = await fetch('https://toomuchstonestodo.onrender.com/getTrello', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const link = await linkResponse.json();
      window.location.href = link;
    }catch(err){
      console.error('取得網址失敗：' ,err);
    }
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
