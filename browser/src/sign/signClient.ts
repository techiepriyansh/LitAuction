import {
    SignProtocolClient,
    SpMode,
    OffChainRpc,
    OffChainSignType,
} from "@ethsign/sp-sdk";

const METADATA_INDEXING_VALUE = "ui-test-1";
const METADATA_SCHEMA_ID = "SPS_cKmgkXVeojP-CdiH7kK7K"

declare global {
    interface Window {
        ethereum: any;
    }
}

export const signMain = async (auctionData: any, consoleLog: (message: string) => void) => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const client = new SignProtocolClient(SpMode.OffChain, {
        signType: OffChainSignType.EvmEip712,
        rpcUrl: OffChainRpc.testnet,
    });

    const attestationInfo = await client.createAttestation({
        schemaId: METADATA_SCHEMA_ID,
        data: {
            metadata: JSON.stringify(auctionData),
        },
        indexingValue: METADATA_INDEXING_VALUE,
    });

    console.log(attestationInfo)
    consoleLog(attestationInfo.attestationId)
}