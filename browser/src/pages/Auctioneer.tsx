import { Route, Routes } from 'react-router-dom';

import AuctioneerDashboard from './auctioneer/AuctioneerDashboard';
import HostAuction from './auctioneer/HostAuction';
import ManageAuction from './auctioneer/ManageAuction';

function Auctioneer() {
  return (
    <Routes>
      <Route path="" element={<AuctioneerDashboard />} />
      <Route path="hostAuction" element={<HostAuction />} />
      <Route path="manageAuction" element={<ManageAuction />} />
    </Routes>
  );
}

export default Auctioneer;