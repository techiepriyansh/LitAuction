//@ts-nocheck
import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { AuthCallbackParams } from "@lit-protocol/types";
import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import { LitAbility, LitAccessControlConditionResource, LitActionResource, createSiweMessageWithRecaps, generateAuthSig } from "@lit-protocol/auth-helpers";
import {ethers} from 'ethers';

import { litActionCode } from './litAction';

const CHAIN = 'sepolia';
const ACTION_CODE_IPFS_HASH='QmPyPRyYJ5fe87of738nAMUAJhzBC3EaQNNbnuRbvHrZnm';
const TRUSTED_CONTRIBUTIONS = [
    // For now, we  only have one trusted contribution in the MVP
    "SPA_MemLjHzCyXFkteRm4wTnh",
]

const genActionSource = () => {
    return litActionCode
}

const ONE_WEEK_FROM_NOW = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7
).toISOString();

const genProvider = () => {
    return new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);
}

const genWallet = (privateKey) => {
    return new ethers.Wallet(privateKey || ethers.utils.randomBytes(32), genProvider());
}

const genAuthSig = async (
    wallet: ethers.Wallet,
    client: LitNodeClient,
    uri: string,
    resources: LitResourceAbilityRequest[]
) => {

    let blockHash = await client.getLatestBlockhash();
    const message = await createSiweMessageWithRecaps({
        walletAddress: wallet.address,
        nonce: blockHash,
        litNodeClient: client,
        resources,
        expiration: ONE_WEEK_FROM_NOW,
        uri
    })
    const authSig = await generateAuthSig({
        signer: wallet,
        toSign: message,
        address: wallet.address
    });


    return authSig;
}

const genSession = async (
    wallet: ethers.Wallet,
    client: LitNodeClient,
    resources: LitResourceAbilityRequest[]) => {
    let sessionSigs = await client.getSessionSigs({
        chain: CHAIN,
        resourceAbilityRequests: resources,
        authNeededCallback: async (params: AuthCallbackParams) => {
          console.log("resourceAbilityRequests:", params.resources);

          if (!params.expiration) {
            throw new Error("expiration is required");
          }
  
          if (!params.resources) {
            throw new Error("resourceAbilityRequests is required");
          }
  
          if (!params.uri) {
            throw new Error("uri is required");
          }

          // generate the authSig for the inner signature of the session
          // we need capabilities to assure that only one api key may be decrypted
          const authSig = genAuthSig(wallet, client, params.uri, params.resourceAbilityRequests ?? []);
          return authSig;
        }
    });

    return sessionSigs;
}

export const litMain = async (pAction, pActionParams) => {
    let client = new LitNodeClient({
        litNetwork: LitNetwork.DatilDev,
        debug: true
    });

    const wallet = genWallet(pActionParams.userRand);
    const chain = CHAIN;
    // lit action will allow anyone to decrypt this api key with a valid authSig
    const accessControlConditions = [
        {
            contractAddress: '',
            standardContractType: '',
            chain,
            method: '',
            parameters: [':currentActionIpfsId'],
            returnValueTest: {
                comparator: '=',
                value: ACTION_CODE_IPFS_HASH,
            },
        },
    ];
    

    await client.connect();

    const actionSourceCode = genActionSource();
    console.log("action source code: ", actionSourceCode);

    const doEncryptionSetup = async (userRand) => {
        const { ciphertext, dataToEncryptHash } = await encryptString(
            {
                accessControlConditions,
                dataToEncrypt: userRand,
            },
            client
        );
        console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);

        const accsResourceString = 
            await LitAccessControlConditionResource.generateResourceString(accessControlConditions as any, dataToEncryptHash);
        const sessionForDecryption = await genSession(wallet, client, [
            {
                resource: new LitActionResource('*'),
                ability: LitAbility.LitActionExecution,
            },
            {
                resource: new LitAccessControlConditionResource(accsResourceString),
                ability: LitAbility.AccessControlConditionDecryption,
    
            }
        ]
        );

        return { ciphertext, dataToEncryptHash, sessionForDecryption };
    }

    let sessionSigs = await genSession(wallet, client, [
        {
            resource: new LitActionResource('*'),
            ability: LitAbility.LitActionExecution,
        },
    ]
    );

    let jsParams = {
        pTrustedContributions: TRUSTED_CONTRIBUTIONS,
        pAccessControlConditions: accessControlConditions,
        pAction,
        pAuctionId: pActionParams.auctionId,
    };

    if (pActionParams.userRand) {
        const { ciphertext, dataToEncryptHash, sessionForDecryption } = await doEncryptionSetup(pActionParams.userRand);
        
        sessionSigs = sessionForDecryption;
        
        jsParams.pUserRandCt = ciphertext;
        jsParams.pUserRandHash = dataToEncryptHash;
    
        if (pActionParams.claimerAddress) {
            jsParams.pClaimerAddress = pActionParams.claimerAddress;
        }
    }

    const res = await client.executeJs({
        sessionSigs,
        ipfsId: ACTION_CODE_IPFS_HASH,
        jsParams,
    });

    console.log("result from action execution:", res);
    console.log("response from action:", JSON.parse(res.response));
    client.disconnect();

    return JSON.parse(res.response);
}

