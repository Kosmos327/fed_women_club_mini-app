import React from 'react';
import ReactDOM from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';
import App from './App';
import './styles.css';

bridge.send('VKWebAppInit');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
