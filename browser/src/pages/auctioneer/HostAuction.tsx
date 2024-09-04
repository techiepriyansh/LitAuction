import React, { useState, useRef, useEffect } from 'react';

function HostAuction() {
    const [auctionData, setAuctionData] = useState({
        name: "",
        endTimestamp: "",
        roundMinDuration: "",
        nftContractAddress: "",
        nftTokenId: "",
    });

    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const addLog = (message: string) => {
        setLogs(prevLogs => [...prevLogs, message]);
    };

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
        addLog(parsedData.name);
    };

    return (
        <div className="h-full w-full flex flex-col">
            <div className="h-24 w-full flex flex-col justify-center text-5xl pl-5">
                Host Auction
            </div>
            <div className="h-full w-full flex flex-row overflow-hidden">
                <form
                    className="w-auto"
                    onSubmit={handleSubmit}
                >
                    <div className="w-full flex flex-col items-start space-y-4 py-4 pl-10">
                        <div className="flex flex-col">
                            <label className="text-base mb-2">Auction Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={auctionData.name}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-80"
                                placeholder="Enter auction name"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base mb-2">End Date and Time:</label>
                            <input
                                type="datetime-local"
                                name="endTimestamp"
                                value={auctionData.endTimestamp}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-80"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base mb-2">Min Round Duration (seconds):</label>
                            <input
                                type="number"
                                name="roundMinDuration"
                                value={auctionData.roundMinDuration}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-80"
                                placeholder="Enter minimum duration of one round"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base mb-2">NFT Contract Address:</label>
                            <input
                                type="text"
                                name="nftContractAddress"
                                value={auctionData.nftContractAddress}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-80"
                                placeholder="Enter NFT contract address"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base mb-2">NFT Token ID:</label>
                            <input
                                type="text"
                                name="nftTokenId"
                                value={auctionData.nftTokenId}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-80"
                                placeholder="Enter NFT token ID"
                            />
                        </div>
                    </div>
                    <div className="mt-2 pl-10">
                        <button
                            type="submit"
                            className="w-80 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Create Auction
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
                                <p key={index} className="text-lg text-gray-700 mb-2">{log}</p>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HostAuction;
