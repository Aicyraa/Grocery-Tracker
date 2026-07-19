import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './css/index.css';
import routes from './routes.tsx';
import ChatBot from './components/chat/ChatBot.tsx';

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <RouterProvider router={routes} />
      <ChatBot />
   </StrictMode>,
);
