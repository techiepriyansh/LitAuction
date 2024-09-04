import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Auctioneer from './pages/Auctioneer';
import Bidder from './pages/Bidder';


import { litMain } from "./lit/litClient";
import { signMain } from "./sign/signClient"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auctioneer/*" element={<Auctioneer />} />
        <Route path="/bidder/*" element={<Bidder />} />
      </Routes>
    </Router>
  );

}

export default App;
