// @ts-nocheck

const _litActionCode = async () => {
    // TODO: change this to secure randomness, with only this action being able to decrypt it
    const GENESIS_RANDOMNESS = {
        ct: "pN/z54XEeVvHgXdsYTTGx8gGox79AjZ5rvlhhHxcGGkKRuPrMrVUoRs1c1jVJgRrJH/DSti6U7stkJWeMO/dFXwhTEVuoYh92xUyLGn5I2CEAbX1UdN361fQT5FL9JS/ITVZ966oHZpExwHUyhTZQtJ+/NGNvMJ5NVasuUvDXx64uYNVgIwoS5JY0KjPatK5eOCg7E6mSBPfLjnhdeZtTukT9mzA7ihj6ux9BNVYdES5+nXS9jRKAdySNW1SQ1Yj98imTcs+6u20sCYfavg61mK0rQ5zQAI=",
        hash: "1904a24ef594d66c2eed310444174ad1d739830a594237061654104159792d0d",
    }
    const CHAIN = 'sepolia';
    const SIGN_SDK_BUNDLE_ACTION = 'QmNMqC1xfFjAwVexZkNqF9ndTtcNUg5z4zmoJq6FMaJYX2';
    const STATE_SCHEMA_ID = 'SPS_ie1xKUzqwI_Pba1Qto0tc';
    const METADATA_SCHEMA_ID = 'SPS_cKmgkXVeojP-CdiH7kK7K';

    const genesisRandPt = await Lit.Actions.decryptAndCombine({
        accessControlConditions: pAccessControlConditions,
        ciphertext: GENESIS_RANDOMNESS.ct,
        dataToEncryptHash: GENESIS_RANDOMNESS.hash,
        authSig: null,
        chain: CHAIN,
    });

    const userRandPt = await Lit.Actions.decryptAndCombine({
        accessControlConditions: pAccessControlConditions,
        ciphertext: pUserRandCt,
        dataToEncryptHash: pUserRandHash,
        authSig: null,
        chain: CHAIN,
    });

    const genesisRandBytes = ethers.utils.arrayify(genesisRandPt);
    
    const genesisPrivateKey = genesisRandBytes.slice(0, 32);
    const genesisPrivateKeyHex = ethers.utils.hexlify(genesisPrivateKey);
    const genesisWallet = new ethers.Wallet(genesisPrivateKey);

    const genesisAuxContribution = genesisRandBytes.slice(32, 64);
    const userAuxContribution = ethers.utils.arrayify(userRandPt).slice(0, 32);
    const auxPrivateKey = ethers.utils.keccak256(ethers.utils.concat([userAuxContribution, genesisAuxContribution]));
    const auxWallet = new ethers.Wallet(auxPrivateKey);

    const rpcUrl = await Lit.Actions.getRpcUrl({ chain: CHAIN });
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const auxWalletBal = await provider.send("eth_getBalance", [auxWallet.address, "latest"]);

    const spQueryRes = await Lit.Actions.call({
        ipfsId: SIGN_SDK_BUNDLE_ACTION,
        params: {
            pRequestType: "query",
            pOpts: { env: "testnet" },
            pMethod: "queryAttestationList",
            pArgs: [{ schemaId: METADATA_SCHEMA_ID, page: 1 }],
        },
    });

    const spQueryAttRes = await Lit.Actions.call({
        ipfsId: SIGN_SDK_BUNDLE_ACTION,
        params: {
            pRequestType: "query",
            pOpts: { env: "testnet" },
            pMethod: "queryAttestation",
            pArgs: [pAuctionId],
        },
    });

    const spSignRes = await Lit.Actions.runOnce(
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
                        state: JSON.stringify({
                            curWinner: 2, prevRoundWinner: 3,
                        }),
                    },
                    indexingValue: "initial-test-2",
                }],
            }
        }),
    )

    const retVal = {
        auxWalletAddress: auxWallet.address,
        auxWalletBal,
        spQueryRes: JSON.parse(spQueryRes),
        spQueryAttRes: JSON.parse(spQueryAttRes),
        spSignRes: JSON.parse(spSignRes),
    };

    Lit.Actions.setResponse({ response: JSON.stringify(retVal) });
}

export const litActionCode = `(${_litActionCode.toString()})();`;