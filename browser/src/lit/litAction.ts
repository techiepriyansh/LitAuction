// @ts-nocheck

const _litActionCode = async () => {
    // TODO: change this to secure randomness, with only this action being able to decrypt it
    const GENESIS_RANDOMNESS = {
        ct: "sBjWTjkYfaqS5q+JDeIwQP64LJeY/gwuOw2oYEPZxtGH0YWSa/77C/9x+FRSOSMXFoPpu7cPqW0dHU22557YsUp7dbR4B/hl94rhxiaD07JD3M1K6XaUFPe+xPJ8wjzW4UTKwGeLh/SaNppU41sZvmEBOSmbcEDfeFtMXnRAr2FE8/huA/Y5vb2ZtRZA/LTpfUSr7AI=",
        hash: "3900f4496392e04aca614ed7e63d5081574ac203543fa7259b67c5d765b9f977",
    }

    const CHAIN = 'sepolia';

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