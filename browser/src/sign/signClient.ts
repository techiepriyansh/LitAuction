import {
    SignProtocolClient,
    SpMode,
    OffChainRpc,
    OffChainSignType,
} from "@ethsign/sp-sdk";

const METADATA_INDEXING_VALUE = "initial-test-2";
const METADATA_SCHEMA_ID = "SPS_cKmgkXVeojP-CdiH7kK7K"

declare global {
    interface Window {
        ethereum: any;
    }
}

export const signMain = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const client = new SignProtocolClient(SpMode.OffChain, {
        signType: OffChainSignType.EvmEip712,
        rpcUrl: OffChainRpc.testnet,
    });

    const attestationInfo = await client.createAttestation({
        schemaId: METADATA_SCHEMA_ID,
        data: {
            metadata: JSON.stringify({
                name: "Eve's Auction 2",
                endTimestamp: 1725540554000,
                roundMinDuration: 300,
                nftContractAddress: "0x423c6Dd00cdeB6ba1BBC4D9c3d50747e7daEB3Ce",
                nftTokenId: "0x1",
            }),
        },
        indexingValue: METADATA_INDEXING_VALUE,
    });

    console.log(attestationInfo);
}