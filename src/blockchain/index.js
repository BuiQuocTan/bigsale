import { STT_OK, STT_INTERNAL_SERVER, CHAIN_SUPPORT } from "../utils/define";
import { bscContractMethods, bscTransaction } from "./bsc";

class Blockchain {
  chain;
  contractMethods;
  transaction;

  constructor() {
    this.chain = CHAIN_SUPPORT.bsc;

    switch (this.chain) {
      case CHAIN_SUPPORT.bsc:
        this.contractMethods = bscContractMethods;
        this.transaction = bscTransaction;
        break;
      default:
        this.contractMethods = {};
        this.transaction = {};
        break;
    }
  }

  sendTransaction = (data) => this.transaction.send(data);

  getTransactionResult = (transactionHash) =>
    this.transaction.getResult(transactionHash);

  call = (functionName, ...args) =>
    callBlockchainFunc(this.contractMethods[functionName], ...args);
}

const callBlockchainFunc = async (func, ...args) => {
  let response = { status: STT_OK, data: {} };

  try {
    response.data = await func(...args);
  } catch (error) {
    response.status = STT_INTERNAL_SERVER;
    response.data.message = error;
  }

  return response;
};

export default Blockchain;
