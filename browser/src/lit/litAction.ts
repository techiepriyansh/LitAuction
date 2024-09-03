// @ts-nocheck

const _litActionCode = async () => {
    // TODO: change this to secure randomness, with only this action being able to decrypt it
    const GENESIS_RANDOMNESS = {
        ct: "gjkAIUHtAY31jzqTkzWf21jEq1nv0PJeuO4ywSbHwY5LfMe/pijqLSD+to84aGYpb7aD3zu0B68MtKRtIJfdfHBfGekLXwcLA7DibJnNWQakAfBPYG0/ptZRIaG8STAhtBKAySKLKSQy+TMoLkLe85/dO9c9gDJCY6EJTLvi/EPSnnwySfxSi1j2+DDPEa5qsOZQ1hnDq+eM2DSNGhqc4kkRsgLUKGaX7ip3xYT2M9NUjX/15H/SGEfp+vUJ1Phz9o8SvBBY8/pWg5hT77X2H4a4D197EB2C/1FxDM0vNG3Z5UWnovcq1QQrnlg0oJFa7dNDCJg6Ag==",
        hash: "9e275d2cab2b92f9a679659b862a9622ec3bef45af39cc069ed1c039d984e7ee",
    }
    const CHAIN = 'sepolia';
    const SIGN_SDK_BUNDLE_ACTION = 'QmNMqC1xfFjAwVexZkNqF9ndTtcNUg5z4zmoJq6FMaJYX2';
    const STATE_SCHEMA_ID = 'SPS_ie1xKUzqwI_Pba1Qto0tc';
    const METADATA_SCHEMA_ID = 'SPS_cKmgkXVeojP-CdiH7kK7K';
    const PRIVATE_STATE_INDEXING_VALUE_PREFIX = 'priv-initial-test-7';
    const PUBLIC_STATE_INDEXING_VALUE_PREFIX = 'pub-initial-test-7';

    const DEFAULT_PUB_STATE = {
        started: false,
        ended: false,
    }

    const DEFAULT_PRIV_STATE = {
        highestBidder: "",
        highestBid: "0x0",
        bidAccountPrivateKey: "",
        nftAccountPrivateKey: "",
    }

    const genesisRandPt = await Lit.Actions.decryptAndCombine({
        accessControlConditions: pAccessControlConditions,
        ciphertext: GENESIS_RANDOMNESS.ct,
        dataToEncryptHash: GENESIS_RANDOMNESS.hash,
        authSig: null,
        chain: CHAIN,
    });

    const genesisRandBytes = ethers.utils.arrayify(genesisRandPt);
    
    const genesisPrivateKey = genesisRandBytes.slice(0, 32);
    const genesisPrivateKeyHex = ethers.utils.hexlify(genesisPrivateKey);
    const genesisWallet = new ethers.Wallet(genesisPrivateKey);

    const genesisEncryptionKey = genesisRandBytes.slice(32, 48);
    const genesisAuxContribution = genesisRandBytes.slice(48, 80);
    
    const rpcUrl = await Lit.Actions.getRpcUrl({ chain: CHAIN });
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const genAuxWallet = async () => {
        const userRandPt = await Lit.Actions.decryptAndCombine({
            accessControlConditions: pAccessControlConditions,
            ciphertext: pUserRandCt,
            dataToEncryptHash: pUserRandHash,
            authSig: null,
            chain: CHAIN,
        });

        const userAuxContribution = ethers.utils.arrayify(userRandPt).slice(0, 32);
        const auxPrivateKey = ethers.utils.keccak256(ethers.utils.concat([userAuxContribution, genesisAuxContribution]));
        const auxWallet = new ethers.Wallet(auxPrivateKey);

        return auxWallet;
    }

    const getMetadata = async () => {
        const resStr = await Lit.Actions.call({
            ipfsId: SIGN_SDK_BUNDLE_ACTION,
            params: {
                pRequestType: "query",
                pOpts: { env: "testnet" },
                pMethod: "queryAttestation",
                pArgs: [pAuctionId],
            },
        });

        const res = JSON.parse(resStr);
        return JSON.parse(JSON.parse(res.data).metadata);
    }

    const getPublicState = async () => {
        const resStr = await Lit.Actions.call({
            ipfsId: SIGN_SDK_BUNDLE_ACTION,
            params: {
                pRequestType: "query",
                pOpts: { env: "testnet" },
                pMethod: "queryAttestationList",
                pArgs: [{
                    schemaId: STATE_SCHEMA_ID,
                    indexingValue: `${PUBLIC_STATE_INDEXING_VALUE_PREFIX}:${pAuctionId}`,
                    attester: genesisWallet.address,
                    page: 1,
                }],
            },
        });

        const res = JSON.parse(resStr);
        if (res.rows.length > 0) {
            return JSON.parse(JSON.parse(res.rows[0].data).state);
        } else {
            return DEFAULT_PUB_STATE;
        }
    }

    const setPublicState = async (state) => {
        await Lit.Actions.runOnce(
            { waitForResponse: true, name: "SignProtocol_createAttestation" },
            async () => await Lit.Actions.call({
                ipfsId: SIGN_SDK_BUNDLE_ACTION,
                params: {
                    pRequestType: "write",
                    pOpts: { privateKey: genesisPrivateKeyHex },
                    pMethod: "createAttestation",
                    pArgs: [{
                        schemaId: STATE_SCHEMA_ID,
                        data: {
                            state: JSON.stringify(state),
                        },
                        indexingValue: `${PUBLIC_STATE_INDEXING_VALUE_PREFIX}:${pAuctionId}`,
                    }],
                }
            }),
        );
    }
    
    const encryptData = async (data) => {
        const key = await crypto.subtle.importKey(
            'raw',
            genesisEncryptionKey,
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );
        const iv = ethers.utils.randomBytes(12);
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );
        return { encryptedData: new Uint8Array(encrypted), iv };
    };
    
    const decryptData = async (encryptedData, iv) => {
        const key = await crypto.subtle.importKey(
            'raw',
            genesisEncryptionKey,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );
        return new Uint8Array(decrypted);
    };
    
    const setPrivateState = async (state) => {
        await Lit.Actions.runOnce(
            { waitForResponse: true, name: "SignProtocol_createAttestation" },
            async () => {
                const stateJsonBytes = ethers.utils.toUtf8Bytes(JSON.stringify(state));
                const { encryptedData, iv } = await encryptData(stateJsonBytes);
    
                const encryptedState = ethers.utils.hexlify(ethers.utils.concat([iv, encryptedData]));
    
                const res = await Lit.Actions.call({
                    ipfsId: SIGN_SDK_BUNDLE_ACTION,
                    params: {
                        pRequestType: "write",
                        pOpts: { privateKey: genesisPrivateKeyHex },
                        pMethod: "createAttestation",
                        pArgs: [{
                            schemaId: STATE_SCHEMA_ID,
                            data: {
                                state: encryptedState,
                            },
                            indexingValue: `${PRIVATE_STATE_INDEXING_VALUE_PREFIX}:${pAuctionId}`,
                        }],
                    }
                });

                return JSON.stringify(res);
            }
        );
    }
    
    const getPrivateState = async () => {
        const resStr = await Lit.Actions.call({
            ipfsId: SIGN_SDK_BUNDLE_ACTION,
            params: {
                pRequestType: "query",
                pOpts: { env: "testnet" },
                pMethod: "queryAttestationList",
                pArgs: [{
                    schemaId: STATE_SCHEMA_ID,
                    indexingValue: `${PRIVATE_STATE_INDEXING_VALUE_PREFIX}:${pAuctionId}`,
                    attester: genesisWallet.address,
                    page: 1,
                }],
            },
        });
    
        const res = JSON.parse(resStr);
        if (res.rows.length > 0) {
            const encryptedState = JSON.parse(res.rows[0].data).state;
            const encryptedStateBytes = ethers.utils.arrayify(encryptedState);
            const iv = encryptedStateBytes.slice(0, 12);
            const encryptedData = encryptedStateBytes.slice(12);
    
            const decryptedBytes = await decryptData(encryptedData, iv);
            const stateJson = ethers.utils.toUtf8String(decryptedBytes);
            return JSON.parse(stateJson);
        } else {
            return DEFAULT_PRIV_STATE;
        }
    }

    const checkERC1155NFTOwnership = async (nftContractAddress, nftTokenId, walletAddress) => {
        const abi = [
            "function balanceOf(address account, uint256 id) view returns (uint256)"
        ];

        try {
            const nftContract = new ethers.Contract(nftContractAddress, abi, provider);
            const balance = await nftContract.balanceOf(walletAddress, nftTokenId);
            return balance.gt(0);
        } catch (error) {
            return false;
        }
    }

    const transferERC1155NFT = async (ownerPrivateKey, receiverAddress, nftContractAddress, nftTokenId, amount = 1) => {
        const resStr = await Lit.Actions.runOnce(
            { waitForResponse: true, name: "transferERC1155NFT" },
            async () => {
                const fn = async () => {
                    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
                    const nftContract = new ethers.Contract(
                        nftContractAddress,
                        [
                            "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external"
                        ],
                        ownerWallet
                    );
            
                    try {
                        const tx = await nftContract.safeTransferFrom(
                            ownerWallet.address,
                            receiverAddress,
                            nftTokenId,
                            amount,
                            "0x"
                        );
                
                        const receipt = await tx.wait();
                        return JSON.stringify(receipt.transactionHash);
                    } catch (error) {
                        return JSON.stringify(null);
                    }
                };

                return JSON.stringify({
                    txHash: await fn(),
                });
            },
        );

        return JSON.parse(resStr);
    }

    const transferMaxBalance = async (fromPrivateKey, toAddress) => {
        const resStr = await Lit.Actions.runOnce(
            { waitForResponse: true, name: "transferERC1155NFT" },
            async () => {
                const fn = async () => {
                    const wallet = new ethers.Wallet(fromPrivateKey, provider);
                    const balance = await wallet.getBalance();
                
                    const gasPrice = await provider.getGasPrice();
                    const tx = {
                        to: toAddress,
                        gasPrice: gasPrice
                    };
                    
                    try {
                        const gasLimit = await provider.estimateGas({ ...tx, from: wallet.address });
                        const estimatedGasCost = gasPrice.mul(gasLimit);
                        const amountToSend = balance.sub(estimatedGasCost);
                    
                        tx.value = amountToSend;
                        tx.gasLimit = gasLimit;
                        const txResponse = await wallet.sendTransaction(tx);
                        await txResponse.wait();
                        return txResponse.hash;
                    } catch (error) {
                        return null;
                    }
                };

                return JSON.stringify({
                    txHash: await fn(),
                })
            },
        );

        return JSON.parse(resStr);
    }

    const litReturn = async (retStatus, retVal = null) => {
        let response = { retStatus, retVal };
        await Lit.Actions.setResponse({ response: JSON.stringify(response) });
    }

    let pubState = await getPublicState();

    const tick = async () => {
        if (!pubState.started || pubState.ended) {
            return;
        }

        const metadata = await getMetadata();
        const { endTimestamp } = metadata;
        if (Date.now() > endTimestamp) {
            pubState.ended = true;
            await setPublicState(pubState);
        }
    }

    await tick();

    switch (pAction) {
        case "tick": {
            return litReturn("success");
        }
        case "genAuxWallet": {
            const auxWallet = await genAuxWallet();
            return litReturn("success", { auxWalletAddress: auxWallet.address });
        }
        case "hostStartAuction": {
            const auxWallet = await genAuxWallet();

            if (pubState.started) {
                return litReturn("eAuctionAlreadyStarted");
            }

            const metadata = await getMetadata();
            const { nftContractAddress, nftTokenId } = metadata;
            const didCommitNft = await checkERC1155NFTOwnership(nftContractAddress, nftTokenId, auxWallet.address);

            if (didCommitNft) {
                privState = await getPrivateState();
                privState.nftAccountPrivateKey = auxWallet.privateKey;
                await setPrivateState(privState);

                pubState.started = true;
                await setPublicState(pubState);
            }

            return litReturn("success", { didCommitNft });
        }
        case "userMakeBid": {
            const auxWallet = await genAuxWallet();

            if (!pubState.started || pubState.ended) {
                return litReturn("eAuctionNotInProgress"); 
            }

            let privState = await getPrivateState();
        
            const auxWalletBal = await provider.send("eth_getBalance", [auxWallet.address, "latest"]);
            if (ethers.BigNumber.from(auxWalletBal).gt(ethers.BigNumber.from(privState.highestBid))) {
                privState.highestBidder = auxWallet.address;
                privState.highestBid = auxWalletBal;
                privState.bidAccountPrivateKey = auxWallet.privateKey;
            }
        
            await setPrivateState(privState);
        
            const retVal = {
                auxWalletAddress: auxWallet.address,
                auxWalletBal,
                metadata: await getMetadata(),
                winningBidder: privState.highestBidder,
                winningBid: privState.highestBid,
                isUserWinning: privState.highestBidder === auxWallet.address,
                bidAccountPrivateKey: privState.bidAccountPrivateKey,
                nftAccountPrivateKey: privState.nftAccountPrivateKey,
                ts: Date.now(),
            };

            return litReturn("success", retVal);
        }
        case "settlementTransferNft": {
            if (!pubState.ended) {
                return litReturn("eAuctionNotEnded");
            }

            const auxWallet = await genAuxWallet();
            const privState = await getPrivateState();
            if (auxWallet.address !== privState.highestBidder) {
                return litReturn("eNotAuctionWinner");
            }

            const metadata = await getMetadata();
            const { nftContractAddress, nftTokenId } = metadata;

            const nftOwnerPrivateKey = privState.nftAccountPrivateKey;

            const { txHash } = await transferERC1155NFT(nftOwnerPrivateKey, pClaimerAddress, nftContractAddress, nftTokenId);
            if (txHash) {
                return litReturn("success", { txHash });
            } else {
                return litReturn("eNftTransferFailed");
            }
        }
        case "settlementTransferBid": {
            if (!pubState.ended) {
                return litReturn("eAuctionNotEnded");
            }

            const auxWallet = await genAuxWallet();
            const privState = await getPrivateState();
            if (auxWallet.privateKey !== privState.nftAccountPrivateKey) {
                return litReturn("eNotAuctionHost");
            }

            const { txHash } = await transferMaxBalance(privState.bidAccountPrivateKey, pClaimerAddress);
            if (txHash) {
                return litReturn("success", { txHash });
            } else {
                return litReturn("eBidTransferFailed");
            }
        }
        default: {
            return litReturn("eInvalidAction");
        }
    }
}

export const litActionCode = `(${_litActionCode.toString()})();`;