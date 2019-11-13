import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import OtherPage from './pages/OtherPage';
import Fib from './pages/Fib'

function App () {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <Link to='/'>Home</Link>
          <Link to='/otherpage'>Not found Page</Link>
        </header>
        <div>
          <Route exact path='/' component={Fib} />
          <Route path='/otherpage' component={OtherPage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
