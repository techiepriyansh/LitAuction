// @ts-nocheck

const _litActionCode = async () => {
    // TODO: change this to secure randomness, with only this action being able to decrypt it
    const GENESIS_RANDOMNESS = {
        ct: "sMmAorR5FvheQNUm7UMT5TQ+N+Ru8lWpm/RCQj2I/g9Oc6InWkcPod02560lvy+m2v4rR55Ai4rJi+XvbRIEx2kr+W85F61gQGONOPjui2hDn1EXLQno2FSoZrkjPN0G4cvj8oy05wwq0mR0XVVqTqruZce0uYTf0F4+c3WoW7CibKZbK2DBu7iw8knecJLIc0Xw8gI=",
        hash: "e3761531b64ebc6b9d728632e195697e27f33ea4bd0282392d7d59712e8d178b",
    }

    const CHAIN = 'ethereum';

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
    const userRandBytes = ethers.utils.arrayify(userRandPt).slice(0, 32);
    
    const combinedRandBytes = ethers.utils.keccak256(ethers.utils.concat([userRandBytes, genesisRandBytes]));
    const auxWallet = new ethers.Wallet(combinedRandBytes); 

    const rpcUrl = await Lit.Actions.getRpcUrl({ chain: CHAIN });
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const auxWalletBal = await provider.send("eth_getBalance", [auxWallet.address, "latest"]);

    const retVal = {
        auxWalletAddress: auxWallet.address,
        auxWalletBal,
    };

    Lit.Actions.setResponse({ response: JSON.stringify(retVal) });
}

export const litActionCode = `(${_litActionCode.toString()})();`;