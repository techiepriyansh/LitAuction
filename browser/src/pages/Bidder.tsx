import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';

import { litMain } from "../lit/litClient";
import { signGetAuctionInfo } from "../sign/signClient";

function Bidder() {
    const [auctionData, setAuctionData] = useState({
        auctionId: "",
        userRandomness: "",
        claimAddress: "",
    });

    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const consoleLog = (message: string) => {
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prevLogs => [...prevLogs, `[${currentTime}] ${message}`]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAuctionData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    };

    const getAuctionInfo = async () => {
        await signGetAuctionInfo(auctionData.auctionId, consoleLog);
    }

    const generateRandomness = () => {
        const generateRandomString = (length: number): string => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charactersLength);
                result += characters[randomIndex];
            }
            return result;
        };
        setAuctionData(prevState => ({
            ...prevState,
            userRandomness: generateRandomString(40),
        }));
        consoleLog("Randomness generated. Keep it somewhere safe. You will need it for all subsequent actions including claiming the NFT (if you win) or refunding the bid amount (if you lose).")
    }

    const computeRandBytesHex = (): string => {
        const userRandHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(auctionData.userRandomness));
        const auctionIdHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(auctionData.auctionId));
        const randBytes = ethers.utils.keccak256(ethers.utils.concat([userRandHash, auctionIdHash]));
        const randBytesHex = ethers.utils.hexlify(userRandHash); // TODO: replace with randBytes
        return randBytesHex;
    }

    const getAuxWalletAddress = async () => {
        const randBytesHex = computeRandBytesHex();
        consoleLog("Generating auxiliary wallet address...")
        const { retVal } = await litMain("genAuxWallet", { auctionId: auctionData.auctionId, userRand: randBytesHex });
        consoleLog(`Auxiliary wallet address: ${retVal.auxWalletAddress}`)
        consoleLog(`To make bids, send funds to this address and click Make Bid. The balance of this address will be considered as your bid amount.`)
    }

    const makeBid = async () => {
        const randBytesHex = computeRandBytesHex();
        consoleLog("Making bid...")
        const { retStatus, retVal } = await litMain("userMakeBid", { auctionId: auctionData.auctionId, userRand: randBytesHex });
        switch (retStatus) {
            case "success": {
                const bidAmount = ethers.utils.formatEther(retVal.auxWalletBal);
                consoleLog(`Bid successful. Bid amount: ${bidAmount} ETH`);
                break;

            }
            case "eAuctionNotInProgress": {
                consoleLog("Auction is not in progress. Cannot make bid.");
                break;
            }
        }
    }

    const checkWin = async () => {
        const randBytesHex = computeRandBytesHex();
        consoleLog("Checking win...");
        const { retStatus, retVal } = await litMain("userCheckWin", { auctionId: auctionData.auctionId, userRand: randBytesHex });
        switch (retStatus) {
            case "success": {
                const { isWinner, ended, curRound } = retVal;
                let lastRound = curRound - 1;
                if (ended) {
                    if (isWinner) {
                        consoleLog("Congratulations! You are the auction winner!");
                    } else {
                        consoleLog("You are not the auction winner.");
                    }
                } else {
                    if (lastRound === 0) {
                        consoleLog("First round has not concluded yet. Cannot check win.");
                    } else {
                        if (isWinner) {
                            consoleLog(`You were the round ${lastRound} winner!`);
                        } else {
                            consoleLog(`You did not win the round ${lastRound}.`)
                        }
                    }
                }
                break;
            }
            case "eAuctionNotStarted": {
                consoleLog("Auction has not started yet. Cannot check win.");
                break;
            }
        }
    }

    const refundBid = async () => {
        const randBytesHex = computeRandBytesHex();
        consoleLog("Refunding bid...");
        const { retStatus, retVal } = await litMain("settlementRevertLosingBid", { auctionId: auctionData.auctionId, userRand: randBytesHex, claimerAddress: auctionData.claimAddress });
        switch (retStatus) {
            case "success": {
                consoleLog(`Bid refunded successfully! Refund tx hash: ${retVal.txHash}`);
                break;
            }
            case "eAuctionNotEnded": {
                consoleLog("Auction not ended yet. Cannot refund bid.");
                break;
            }
            case "eNotLosingBidder": {
                consoleLog("You are the auction winner! Cannot refund bid.");
                break;
            }
            case "eBidTransferFailed": {
                consoleLog("Failed to refund bid amount");
                consoleLog(`Ensure that there are enough funds in the auxiliary wallet address: ${retVal.holderWalletAddress}`);
                break;
            }
        }
    }

    const claimNft = async () => {
        const randBytesHex = computeRandBytesHex();
        consoleLog("Claiming NFT...");
        const { retStatus, retVal } = await litMain("settlementClaimNft", { auctionId: auctionData.auctionId, userRand: randBytesHex, claimerAddress: auctionData.claimAddress });
        switch (retStatus) {
            case "success": {
                if (retVal.txHash === "") {
                    consoleLog("NFT claim transaction broadcasted. It should be confirmed on the blockchain shortly.")
                } else {
                    consoleLog(`NFT claimed successfully! NFT claim tx hash: ${retVal.txHash}`);
                }

                break;
            }
            case "eAuctionNotEnded": {
                consoleLog("Auction has not ended yet. Cannot claim NFT.");
                break;
            }
            case "eNotAuctionWinner": {
                consoleLog("You are not the auction winner. Cannot claim NFT.");
                break;
            }
            case "eNftTransferFailed": {
                consoleLog("Failed to transfer NFT");
                consoleLog(`Ensure that there are enough funds in the auxiliary NFT holder address: ${retVal.holderWalletAddress}`);
                break;
            }
        }
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="h-24 w-full flex flex-col justify-center text-5xl pl-5">
                Bidder Dashboard
            </div>
            <div className="h-full w-full flex flex-row overflow-hidden">
                <form
                    onSubmit={handleSubmit}
                    className="w-auto"
                >
                    <div className="w-full flex flex-col items-start space-y-4 py-4 pl-10">
                        <div className="flex flex-col">
                            <label className="text-base mb-2">Auction ID:</label>
                            <input
                                type="text"
                                name="auctionId"
                                value={auctionData.auctionId}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-96"
                                placeholder="Enter auction ID"
                            />
                        </div>
                    </div>
                    <div className="pl-10">
                        <button
                            onClick={getAuctionInfo}
                            className="w-96 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Get Auction Info
                        </button>
                    </div>
                    <div className="w-full flex flex-col items-start py-4 pl-10">
                        <div className="flex flex-col">
                            <label className="text-base mb-2">User Randomness:</label>
                            <input
                                type="text"
                                name="userRandomness"
                                value={auctionData.userRandomness}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-96"
                                placeholder="Enter any random text"
                            />
                        </div>
                    </div>
                    <div className="pl-10">
                        <button
                            onClick={generateRandomness}
                            className="w-96 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Generate Randomness
                        </button>
                    </div>
                    <div className="mt-4 pl-10">
                        <button
                            onClick={getAuxWalletAddress}
                            className="w-96 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Get Aux Wallet Address
                        </button>
                    </div>
                    <div className="mt-4 pl-10">
                        <button
                            onClick={makeBid}
                            className="w-96 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Make Bid
                        </button>
                    </div>
                    <div className="mt-4 pl-10">
                        <button
                            onClick={checkWin}
                            className="w-96 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Check Win
                        </button>
                    </div>
                    <div className="w-full flex flex-col items-start py-4 pl-10">
                        <div className="flex flex-col">
                            <label className="text-base mb-2">Refund/Claim Address:</label>
                            <input
                                type="text"
                                name="claimAddress"
                                value={auctionData.claimAddress}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-96"
                                placeholder="Enter address to receive refund or claim NFT"
                            />
                        </div>
                    </div>
                    <div className="pl-10">
                        <div className="w-96 flex flex-row justify-between space-x-4">
                            <button
                                onClick={refundBid}
                                className="flex-1 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                            >
                                Refund Bid
                            </button>
                            <button
                                onClick={claimNft}
                                className="flex-1 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                            >
                                Claim NFT
                            </button>
                        </div>
                    </div>
                </form>
                <div className="h-full w-full ml-10 p-10 bg-gray-100 border border-gray-300 flex flex-col overflow-hidden">
                    <h2 className="text-2xl mb-4">Logs</h2>
                    <div className="flex-1 overflow-y-auto max-h-screen">
                        {logs.length === 0 ? (
                            <p className="text-lg text-gray-500">No logs to display.</p>
                        ) : (
                            logs.map((log, index) => (
                                <p key={index} className="text-base text-gray-700 mb-2 font-mono">{log}</p>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Bidder;
