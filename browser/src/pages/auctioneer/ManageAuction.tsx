import React, { useState, useRef, useEffect } from 'react';

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
            auctionId: auctionData.auctionId,
            userRandomness: auctionData.userRandomness,
        };
        console.log(parsedData);
        addLog(`Auction ID: ${parsedData.auctionId}`);
    };

    return (
        <div className="h-full w-full flex flex-col">
            <div className="h-24 w-full flex flex-col justify-center text-5xl pl-5">
                Manage Auction
            </div>
            <div className="h-full w-full flex flex-row overflow-hidden">
                <form
                    className="w-auto"
                    onSubmit={handleSubmit}
                >
                    <div className="w-full flex flex-col items-start space-y-4 py-4 pl-10">
                        <div className="flex flex-col">
                            <label className="text-base mb-2">Auction ID:</label>
                            <input
                                type="text"
                                name="auctionId"
                                value={auctionData.auctionId}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 w-80"
                                placeholder="Enter auction ID"
                            />
                        </div>
                    </div>
                    <div className="pl-10">
                        <button
                            className="w-80 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
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
                                className="border border-gray-300 rounded-md p-2 w-80"
                                placeholder="Enter user randomness"
                            />
                        </div>
                    </div>
                    <div className="pl-10">
                        <button
                            className="w-80 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
                        >
                            Generate Aux Wallet
                        </button>
                    </div>
                    <div className="mt-4 pl-10">
                        <button
                            className="w-80 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
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
                                className="border border-gray-300 rounded-md p-2 w-80"
                                placeholder="Enter address to receive the winning bid"
                            />
                        </div>
                    </div>
                    <div className="pl-10">
                        <button
                            className="w-80 bg-[#00a2e7] text-white rounded-md px-4 py-2 hover:bg-[#00a8f0] hover:shadow-lg transition-all duration-300"
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

export default ManageAuction;
