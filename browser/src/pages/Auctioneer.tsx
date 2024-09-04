import { Link, Route, Routes } from 'react-router-dom';

import HostAuction from './auctioneer/HostAuction';
import ManageAuction from './auctioneer/ManageAuction';

function Auctioneer() {
  const AuctioneerDashboard = () => {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="h-24 w-full flex flex-col justify-center text-5xl pl-5">Auctioneer Dashboard</div>
        <div className="h-full w-full flex flex-col items-start text-2xl space-y-1 py-2 pl-10 text-[#00a2e7]">
          <div> <Link to="hostAuction"> ⤷ Host Auction </Link> </div>
          <div> <Link to="manageAuction"> ⤷ Manage Auction </Link> </div>
        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="" element={<AuctioneerDashboard />} />
      <Route path="hostAuction" element={<HostAuction />} />
      <Route path="manageAuction" element={<ManageAuction />} />
    </Routes>
  );
}

export default Auctioneer;