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
    const INDEXING_VALUE_PREFIX = 'initial-test-3';

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

    const genesisEncryptionKey = genesisRandBytes.slice(32, 48);

    const genesisAuxContribution = genesisRandBytes.slice(48, 80);
    const userAuxContribution = ethers.utils.arrayify(userRandPt).slice(0, 32);
    const auxPrivateKey = ethers.utils.keccak256(ethers.utils.concat([userAuxContribution, genesisAuxContribution]));
    const auxWallet = new ethers.Wallet(auxPrivateKey);

    const rpcUrl = await Lit.Actions.getRpcUrl({ chain: CHAIN });
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const auxWalletBal = await provider.send("eth_getBalance", [auxWallet.address, "latest"]);

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
    
    const setStateEncrypted = async (state) => {
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
                            indexingValue: `${INDEXING_VALUE_PREFIX}:${pAuctionId}`,
                        }],
                    }
                });

                return JSON.stringify(res);
            }
        );
    }
    
    const getStateEncrypted = async () => {
        const resStr = await Lit.Actions.call({
            ipfsId: SIGN_SDK_BUNDLE_ACTION,
            params: {
                pRequestType: "query",
                pOpts: { env: "testnet" },
                pMethod: "queryAttestationList",
                pArgs: [{
                    schemaId: STATE_SCHEMA_ID,
                    indexingValue: `${INDEXING_VALUE_PREFIX}:${pAuctionId}`,
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
            return null;
        }
    }

    let state = await getStateEncrypted();
    if (state === null) {
        state = {
            round: 0,
        }
    }

    state.round++;
    await setStateEncrypted(state);

    const retVal = {
        auxWalletAddress: auxWallet.address,
        auxWalletBal,
        metadata: await getMetadata(),
        round: state.round,
    };

    Lit.Actions.setResponse({ response: JSON.stringify(retVal) });
}

export const litActionCode = `(${_litActionCode.toString()})();`;