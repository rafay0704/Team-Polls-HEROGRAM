import React, { useState } from 'react';
import Auth from '../src/components/Auth';
import Polls from '../src/components/Polls';



const App = () => {
  const [token, setToken] = useState('');

  return (
    <div>
      <h1>Poll App</h1>
      {!token ? (
        <Auth setToken={setToken} />
      ) : (
        <Polls token={token} />
      )}
    </div>
  );
};

export default App;
