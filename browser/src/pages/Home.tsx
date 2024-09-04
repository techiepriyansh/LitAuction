import { Link } from 'react-router-dom';

function Home() {
  return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="h-1/2 w-auto flex flex-col">
          <div className="h-48 w-full flex flex-col justify-center items-center text-8xl">Lit Auction</div>
          <div className="h-full flex flex-col items-start text-3xl space-y-1 py-2 pl-5 text-[#00a2e7]">
            <div> <Link to="/auctioneer"> ⤷ Auctioneer </Link> </div>
            <div> <Link to="/bidder"> ⤷ Bidder </Link> </div>
          </div>
        </div>
      </div>
  );
}

export default Home;