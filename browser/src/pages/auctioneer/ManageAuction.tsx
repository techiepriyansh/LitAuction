import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';

import { litMain } from "../../lit/litClient";
import { signGetAuctionInfo } from "../../sign/signClient";

function ManageAuction() {
    const [auctionData, setAuctionData] = useState({
        auctionId: "",
        userRandomness: "",
        bidClaimAddress: "",
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
        consoleLog("Randomness generated. Keep it somewhere safe. You will need it for all subsequent actions including bid claim.")
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
        consoleLog(`You will need to commit your NFT to this address before starting the auction.`)
    }

    const startAuction = async () => {
        consoleLog("Starting auction...")
        const { retStatus } = await litMain("hostStartAuction", { auctionId: auctionData.auctionId, userRand: computeRandBytesHex() });
        switch (retStatus) {
            case "success": {
                consoleLog("Auction started successfully.");
                break;
            }
            case "eAuctionAlreadyStarted": {
                consoleLog("Auction already started.");
                break;
            }
            case "eDidNotCommitNft": {
                consoleLog("NFT not committed to auxiliary wallet. Please commit the NFT before starting the auction.");
                break;
            }
        }
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="h-24 w-full flex flex-col justify-center text-5xl pl-5">
                Manage Auction
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
                            onClick={startAuction}
                            className="w-96 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Start Auction
                        </button>
                    </div>
                    <div className="w-full flex flex-col items-start py-4 pl-10">
                        <div className="flex flex-col">
                            <label className="text-base mb-2">Bid Claim Address:</label>
                            <input
                                type="text"
                                name="bidClaimAddress"
                                value={auctionData.bidClaimAddress}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-96"
                                placeholder="Enter address to receive the winning bid"
                            />
                        </div>
                    </div>
                    <div className="pl-10">
                        <button
                            className="w-96 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Claim Bid
                        </button>
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

export default ManageAuction;
