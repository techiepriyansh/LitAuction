// @ts-nocheck

const _litActionCode = async () => {
    const GENESIS_RANDOMNESS = ethers.utils.arrayify('0xae47223deec5323cc26aadeda4723d387f723031b8f539ec7dfdeb6653a10b72');
    const skSeedBytes = await crypto.subtle.digest('SHA-256', GENESIS_RANDOMNESS);
    const serializable = Array.from(new Uint8Array(skSeedBytes));

    const userRandPt = await Lit.Actions.decryptAndCombine({
        accessControlConditions: pAccessControlConditions,
        ciphertext: pUserRandCt,
        dataToEncryptHash: pUserRandHash,
        authSig: null,
        chain: 'ethereum',
    });


    const retVal = {
        userRandPt,
        serializable,
    };

    Lit.Actions.setResponse({ response: JSON.stringify(retVal) });
}

export const litActionCode = `(${_litActionCode.toString()})();`;