import { litMain } from "./lit/litClient";
import { signMain } from "./sign/signClient"

function App() {

  return (
    <>
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="h-1/2 w-auto flex flex-col">
        <div className="h-48 w-full flex flex-col justify-center items-center text-8xl">Lit Auction</div>
        <div className="h-full flex flex-col items-start text-3xl space-y-1 py-2 pl-5">
          <div> Auctioneer </div>
          <div> Bidder </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
