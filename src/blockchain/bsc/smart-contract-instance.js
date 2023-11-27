import { ethers } from "ethers";
import { RPC_URL_BSC, BSC_CONTRACT_ADDRESS } from "../../utils/define";
import {
  Deployer,
  LiquidityToken,
  StandardToken,
  Token,
  TokenLock,
  LaunchPad,
  ManageToken,
  BulkTransfer,
  BabyToken,
  BuyBackBabyToken,
} from "./builds";

import {
  LiquidityTokenByteCode,
  StandardTokenByteCode,
  BabyTokenByteCode,
  BuyBackBabyTokenByteCode,
} from "./bytecode";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL_BSC);

export const getBSCSmartContractFromAbi = (contractAddress, { abi }) => {
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);

    return contract;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const DeployerInstance = getBSCSmartContractFromAbi(
  BSC_CONTRACT_ADDRESS.DEPLOYER,
  Deployer
);

export const getLaunchpadInstance = (address) =>
  getBSCSmartContractFromAbi(address, LaunchPad);

export const getTokenInstance = (address) =>
  getBSCSmartContractFromAbi(address, Token);

export default {
  DeployerInstance,
  getBSCSmartContractFromAbi,
  getLaunchpadInstance,
  getTokenInstance,
  LiquidityTokenAbi: LiquidityToken.abi,
  StandardTokenAbi: StandardToken.abi,
  TokenAbi: Token.abi,
  TokenLockAbi: TokenLock.abi,
  LiquidityTokenByteCode,
  StandardTokenByteCode,
  DeployerAbi: Deployer.abi,
  LaunchPadAbi: LaunchPad.abi,
  ManageTokenAbi: ManageToken.abi,
  MultiSendTokenAbi: BulkTransfer.abi,
  BabyTokenAbi: BabyToken,
  BabyTokenByteCode,
  BuyBackBabyTokenByteCode,
  BuyBackBabyTokenAbi: BuyBackBabyToken,
};
