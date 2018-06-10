import React, { Component } from 'react';
import SystemInfo from './components/system-info'

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="container">
        <SystemInfo/>
      </div>
    );
  }
}

export default App;
