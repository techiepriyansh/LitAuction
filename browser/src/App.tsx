import { litMain } from "./lit/litClient";
import { signMain } from "./sign/signClient"

function App() {

  return (
    <>
      <div className="card">
        <hr />
        <h3>Lit Auction</h3>
        <button onClick={async () => await litMain("genAuxWallet")}>
          Gen Aux Wallet
        </button>
        <button onClick={async () => await litMain("userMakeBid")}>
          Bid
        </button>
        <button onClick={async () => await signMain()}>
          Host
        </button>
        <button onClick={async () => await litMain("hostStartAuction")}>
          Start Auction
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
