import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import App from './App.jsx'
import './index.css'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_iziud07nl',
      userPoolClientId: '6fp20v9c9ue2kntqgchcpojbek',
      region: 'ap-south-1'
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
