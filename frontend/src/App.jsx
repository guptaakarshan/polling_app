import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePoll from './components/CreatePoll';
import PollView from './components/PollView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreatePoll />} />
        <Route path="/poll/:pollId" element={<PollView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;