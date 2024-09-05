import {
    IndexService,
    SignProtocolClient,
    SpMode,
    OffChainRpc,
    OffChainSignType,
} from "@ethsign/sp-sdk";

const METADATA_INDEXING_VALUE = "ui-test-1";
const METADATA_SCHEMA_ID = "SPS_cKmgkXVeojP-CdiH7kK7K"

const STATE_SCHEMA_ID = 'SPS_ie1xKUzqwI_Pba1Qto0tc';
const PUBLIC_STATE_INDEXING_VALUE_PREFIX = 'pub-initial-test-9';

const LIT_ACTION_GENESIS_ADDRESS = "0xD7ee54530aBb90c0748192AD4F5fCcf6695c7129";

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

export const signGetAuctionInfo = async (auctionId: string, consoleLog: (message: string) => void) => {
    const client = new IndexService("testnet");

    const auctionInfo = await client.queryAttestation(auctionId);
    if (auctionInfo) {
        const resData = JSON.parse(auctionInfo.data);
        const metadata = JSON.parse(resData.metadata);
        const { name, endTimestamp, roundMinDuration, nftContractAddress, nftTokenId } = metadata;
        consoleLog(`Name: ${name}, End time: ${new Date(endTimestamp)}, Minimum round duration: ${roundMinDuration}s, NFT contract address: ${nftContractAddress}, NFT token ID: ${nftTokenId}`)
    } else {
        return consoleLog("Coundn't fetch auction info");
    }

    const auctionState = await client.queryAttestationList({
        schemaId: STATE_SCHEMA_ID,
        indexingValue: `${PUBLIC_STATE_INDEXING_VALUE_PREFIX}:${auctionId}`,
        attester: LIT_ACTION_GENESIS_ADDRESS,
        page: 1,
    });
    console.log(auctionState);
    if (auctionState?.rows.length) {
        const resData = JSON.parse(auctionState.rows[0].data);
        const state = JSON.parse(resData.state);
        const { started, ended, curRound, curRoundStartTimestamp } = state;
        consoleLog(`Started: ${started}, Ended: ${ended}, Current round: ${curRound}, Current round start time: ${new Date(curRoundStartTimestamp)}`)
    } else {
        return consoleLog("Coundn't fetch auction state");
    }

}