import React, { useState } from 'react';

function HostAuction() {
    const [auctionData, setAuctionData] = useState({
        name: "",
        endTimestamp: "",
        roundMinDuration: "",
        nftContractAddress: "",
        nftTokenId: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAuctionData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedData = {
            name: auctionData.name,
            endTimestamp: new Date(auctionData.endTimestamp).getTime(),
            roundMinDuration: parseInt(auctionData.roundMinDuration),
            nftContractAddress: auctionData.nftContractAddress,
            nftTokenId: auctionData.nftTokenId,
        };
        console.log(parsedData);
    };

    return (
        <div className="h-full w-full flex flex-col">
            <div className="h-24 w-full flex flex-col justify-center text-5xl pl-5">
                Host Auction
            </div>
            <form
                onSubmit={handleSubmit}
            >
                <div className="w-full flex flex-col items-start space-y-4 py-4 pl-10">
                    <div className="flex flex-col">
                        <label className="text-xl mb-2">Auction Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={auctionData.name}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md p-2 w-72"
                            placeholder="Enter auction name"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xl mb-2">End Date and Time:</label>
                        <input
                            type="datetime-local"
                            name="endTimestamp"
                            value={auctionData.endTimestamp}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md p-2 w-72"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xl mb-2">Round Min Duration (seconds):</label>
                        <input
                            type="number"
                            name="roundMinDuration"
                            value={auctionData.roundMinDuration}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md p-2 w-72"
                            placeholder="Enter round minimum duration"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xl mb-2">NFT Contract Address:</label>
                        <input
                            type="text"
                            name="nftContractAddress"
                            value={auctionData.nftContractAddress}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md p-2 w-72"
                            placeholder="Enter NFT contract address"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xl mb-2">NFT Token ID:</label>
                        <input
                            type="text"
                            name="nftTokenId"
                            value={auctionData.nftTokenId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md p-2 w-72"
                            placeholder="Enter NFT token ID"
                        />
                    </div>
                </div>
                <div className="mt-4 pl-10">
                    <button
                        type="submit"
                        className="w-72 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                    >
                        Create Auction
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HostAuction;
