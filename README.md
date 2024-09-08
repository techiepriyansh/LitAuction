# LitA*u*ction

LitAuction is an NFT auction platform designed for anonymous bidding, offering a secure and private auction experience. The platform enables users to host auctions where participants can shield their bids, ensuring that no one knows how much others are bidding. A key component is the use of "pre-programmed wallets" powered by Lit Protocol’s "Decrypt within an Action" feature. These wallets commit to the auction's assets and bids in a secure, controlled manner, ensuring that only authorized actions—like submitting a bid or claiming a refund—can be performed.

The auction process consists of multiple rounds where participants bid anonymously. Unlike traditional auctions, participants receive only minimal feedback after each round—specifically, whether they won the most recent round. This setup ensures that bidders make decisions based solely on their valuation of the NFT, with limited influence from others' bids.

The platform is designed to be seamless for both auction hosts and bidders. Hosts submit NFT auction details, and the platform handles everything from wallet creation to NFT and bid settlements. Bidders join auctions anonymously, committing their bids to auxiliary wallets that they do not fully control, ensuring the integrity of the bidding process. Only at the end of the auction do the highest bidders get to claim their NFTs, while unsuccessful bidders can easily retrieve their funds.


## Auction Flow
1. Auction Creation by Host:
   - The host wants to sell an NFT.
   - They submit the necessary details for the auction to the web application.
   - The transaction is authorized, posting the auction metadata to the Sign Protocol, and the host receives an auction ID for managing the auction.

2. Setting Up the Auction:
   - The host generates randomness, which acts as an authorization token.
   - An auxiliary wallet is created, where the NFT is committed by transferring it to this wallet.
   - Once the NFT is transferred, the auction can officially start.

3. Bidders Join the Auction:
   - Bidders interested in participating in the auction enter the auction ID and generate auxiliary wallets.
   - Each bidder commits their bid by transferring funds to their respective auxiliary wallets.
   - Bidders do not know the amount others have bid and place bids based on their own valuation of the NFT.

4. Auction Progress with Rounds:
   - The auction consists of multiple rounds. In each round, bidders place their bids anonymously by committing an amount to their auxiliary wallets.
   - After each round, bidders are can check if they won the round. This feedback helps them re-evaluate their strategy, but no further details (such as other bidders' bids or rankings) are disclosed.
   - Based on this minimal information, bidders can decide whether to increase or maintain their bid for the next round.

6. Final Auction End and Results:
   - The final round concludes at a predefined time, ending the auction.
   - Bidders check the final results to see if they won the entire auction. The bidder with the highest bid in the final round wins.

7. Claiming the NFT:
   - The winning bidder claims the NFT committed by the host by providing their details.
   - The NFT is then transferred to the winning bidder’s wallet.

8. Refunds for Unsuccessful Bidders:
   - Unsuccessful bidders can request refunds of the amounts they committed as bids.
   - After processing, the funds are returned to their respective wallets.

9. Host Claims the Winning Bid:
   - The host, as the auctioneer, can now claim the winning bid amount from the final round.
   - The bid is transferred to the host’s wallet, completing the auction process.

## Pre-Programmed Wallets: Technical Details
**Pre-programmed wallets**
- These wallets do not give their owners full control over all operations. Instead, they permit specific actions, and only under certain conditions. This behaviour is pre-defined in the form of a Lit Action.
- For an example, consider the Bidder's auxiliary wallet in the project. It's used in the process of making bids, specifically for the task of committing to the bids. The bidders don't own the private key to this wallet, so they can't move funds as they wish, ensuring the wallet's integrity as a "commitment" wallet. But the bidders do own a sort of an authorization token that allows them to get their committed bids back when the auction is over and they are not the winners.

**Generating private keys for pre-programmed wallets**
- The private keys for these wallets are created by combining two sources of randomness: one provided by the user and another called "genesis randomness."
- The genesis randomness is created through a trusted setup ceremony. In this process, participants generate random data (a fixed number of bytes), encrypt it using Lit Protocol, and set permissions so that only a Lit Action can decrypt it. This encrypted data is then published to the Sign Protocol. The Lit Action later retrieves, decrypts, and combines the random data to produce the genesis randomness. The randomness remains secure as long as at least one participant in the trusted setup ceremony is honest.
- This method of private key generation ensures that the keys are controlled solely by the Lit Action, not by any other individual or entity. The user's randomness serves as an authorization token, allowing secure access to the "pre-programmed" wallet.


## Setup Instructions
Clone the repsitory, then from the repository root, run the following commands:
```bash
cd browser
npm install
npm run dev
```