import { IndexService, SignProtocolClient, OffChainSignType, OffChainRpc, SpMode } from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
    if (pRequestType == "query") {
        const indexService = new IndexService(pOpts.env);
        const res = await indexService[pMethod](...pArgs);
        Lit.Action.setResponse({
            response: JSON.stringify(res)
        });
    } else if (pRequestType == "write") {
        const client = new SignProtocolClient(SpMode.OffChain, {
            signType: OffChainSignType.EvmEip712,
            account: privateKeyToAccount(pOpts.privateKey),
            rpcUrl: pOpts.env == "mainnet" ? OffChainRpc.mainnet : OffChainRpc.testnet,
        });
        const res = await client[pMethod](...pArgs);
        Lit.Action.setResponse({
            response: JSON.stringify(res)
        });
    }
}

main();
