import { memo, useEffect, useState } from "react";
import { PrimaryButton } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { multiSendToken } from "../../../services/blockchainService";
import { formatNumberToCurrencyString, shortenAddress } from "../../../utils";
import { CHAIN_INFO, CHAIN_SUPPORT } from "../../../utils/define";
import { ItemInfo, TxData } from "./AddAllocation";

const Confirmation = ({
  data,
  onGoBack,
}: {
  data: TxData;
  onGoBack: () => void;
}) => {
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  const handleSendTransaction = async () => {
    setIsSendingTx(true);
    const dataFormat = data.allocationInfo.map((item) => {
      const tempItem = Object.values(item);
      return [tempItem[0], tempItem[1].toString()];
    });

    const tx = await multiSendToken(dataFormat, data.tokenAddress);
    setTransactionHash(tx?.hash);
    const receipt = await tx.wait();
    setIsSendingTx(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <div className="flex flex-col gap-y-2">
          <ItemInfo
            label="Total address"
            content={data.allocationInfo.length}
          />
          <ItemInfo
            label="Amount to send"
            content={`${data.totalSendValue} ${data.tokenInfo.symbol}`}
          />
          <ItemInfo label="Number of transaction" content="1" />
          <ItemInfo
            label="Your token balance"
            content={formatNumberToCurrencyString(MOCK_TOKEN_BALANCE)}
          />
          <ItemInfo label="Token to send" content={data.tokenInfo.symbol} />
        </div>
        <table className="mt-6 mb-10">
          <thead>
            <tr>
              <th>Address</th>
              <th className="w-full text-center">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.allocationInfo &&
              data.allocationInfo.map((item, index) => (
                <tr key={index}>
                  <td className="pt-2">{item.address}</td>
                  <td className="w-full text-center">{item.value}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!transactionHash && (
          <div className="flex justify-center gap-x-4">
            <button
              className="bg-none text-white border border-gray rounded w-32"
              onClick={onGoBack}
            >
              Back
            </button>
            <PrimaryButton
              size="medium"
              onClick={handleSendTransaction}
              disabled={isSendingTx}
            >
              Process
            </PrimaryButton>
          </div>
        )}

        {transactionHash && (
          <p className="flex justify-between">
            {isSendingTx ? "Sending" : "Completed"}:
            <a
              href={`${
                CHAIN_INFO[CHAIN_SUPPORT.bsc].baseNetworkUrl.testnet
              }/tx/${transactionHash}`}
              target="_blank"
              className="pl-1"
            >
              {shortenAddress(transactionHash)}
            </a>
          </p>
        )}
      </Card>
    </div>
  );
};

export default memo(Confirmation);

const MOCK_TOKEN_BALANCE = 20317.363079449788;
