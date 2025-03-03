import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Resume from './pages/Resume';
import Chat from './pages/Chat';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Resume />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
} 