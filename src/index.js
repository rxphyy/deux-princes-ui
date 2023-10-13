import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className='appParent'>
      <App/>
      <div className='footer'>
        <a className='footerInfo' target="_blank" rel="noopener noreferrer" href='https://github.com/rxphyy?tab=repositories'>
          <i id='footerIcon' className="fa-brands fa-github"></i>
          &nbsp;Fait par Raphaël Marier
        </a>
      </div>
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
