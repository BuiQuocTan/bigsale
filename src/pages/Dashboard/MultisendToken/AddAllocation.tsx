import {
  useMemo,
  useState,
  ChangeEvent,
  useRef,
  memo,
  useEffect,
  useCallback,
} from "react";
import { Card } from "../../../components/common/Card";
import {
  InputContainer,
  Label,
  Input,
  TextArea,
} from "../../../components/common/Inputs";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "../../../components/common/Button";
import { formatNumberToCurrencyString, getBNFromToken } from "../../../utils";
import { Alert } from "../../../components/common/Alerts";
import Papaparse from "papaparse";
import {
  getConnectedWallet,
  getStandardTokenBalance,
  isValidAddress,
  checkTokenAllowance,
  approveTokenMultiSend,
} from "../../../services/blockchainService";

const validationSchema = Yup.object().shape({
  tokenAddress: Yup.string().required("Token address is required"),
  allocation: Yup.string().required("Recipients allocation is required"),
});
const formOptions = { resolver: yupResolver(validationSchema) };

type TokenInfo = {
  name?: string;
  symbol?: string;
  decimals?: number;
  balance?: number;
};

type DataItem = {
  address: string;
  value: number;
};

type Allocation = DataItem[];

export type TxData = {
  allocationInfo: Allocation;
  tokenInfo: TokenInfo;
  totalSendValue: number;
  tokenAddress: string;
};

const AddAllocation = ({
  onGoToNextStep,
}: {
  onGoToNextStep: (value: TxData) => void;
}) => {
  const { register, handleSubmit } = useForm(formOptions);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [walletAddress, setWalletAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [allocationInputValue, setAllocationInputValue] = useState("");
  const [allocation, setAllocation] = useState<Allocation>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({});
  const [approveOption, setApproveOption] = useState(
    APPROVE_AMOUNT_VALUE.unlimited
  );
  const [hasApproved, setHasApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const showApproveContent = useMemo(
    () => tokenAddress && allocation.length > 0,
    [tokenAddress, allocation]
  );

  const totalSendValue = useMemo(() => {
    if (allocation.length > 0) {
      return allocation.reduce((sumValue, a) => sumValue + a.value, 0);
    }
    return 0;
  }, [allocation]);

  const handleTokenAddressChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setTokenInfo({});
    setTokenAddress("");
    if (!e.target.value) return;
    const isValidTokenAddress = isValidAddress(e.target.value);

    if (isValidTokenAddress) {
      setTokenAddress(e.target.value);
      const tokenStandardInfo = await getStandardTokenBalance(
        e.target.value,
        walletAddress
      );

      setTokenInfo({
        name: tokenStandardInfo?.tname,
        symbol: tokenStandardInfo?.tsymbol,
        decimals: tokenStandardInfo?.decimals,
        balance: Number(tokenStandardInfo?.calc_balance),
      });
    } else {
      return;
    }
  };

  const handleAllocationChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAllocationInputValue(e.target.value);
    const value = e.target.value.split("\n");
    const formatValue = value.map((item) => {
      let itemData = [];
      if (item.includes(",")) {
        itemData = item.split(",");
      } else {
        itemData = item.split(" ");
      }
      return { address: itemData[0], value: Number(itemData[1]) };
    });
    setAllocation(formatValue);
  };

  const handleSelectCsvFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileArr = event?.target?.files;
    if (!fileArr?.length) return;
    const dataFile = fileArr[0];
    Papaparse.parse(dataFile, {
      download: true,
      skipEmptyLines: true,
      complete: function (results: {
        data: Array<any>;
        errors: Array<any>;
        meta: object;
      }) {
        const data = results.data;

        const formatData = data.map((item) => ({
          address: item[0],
          value: Number(item[1]),
        }));
        setAllocation(formatData);

        const tempValue = data.map((item) => item.join());
        const formatValue = tempValue.join("\n");
        setAllocationInputValue(formatValue);
      },
    });
  };

  const handleViewSampleFile = async () => {
    await Alert({
      title: "Sample CSV file",
      showCloseButton: true,
      message: (
        <div className="flex flex-col items-start text-sm border border-gray p-5 ">
          <p>0x0000000000000000000000000000000000001000 13.45</p>
          <p>0x0000000000000000000000000000000000001000 1.049</p>
          <p>0x0000000000000000000000000000000000001000 1</p>
        </div>
      ),
    });
  };

  const handleApproveMultiSend = async () => {
    if (hasApproved) {
      onGoToNextStep({
        allocationInfo: allocation,
        tokenInfo,
        totalSendValue,
        tokenAddress,
      });
    } else {
      setIsApproving(true);
      let approveAmount;
      if (approveOption === APPROVE_AMOUNT_VALUE.limited) {
        approveAmount = getBNFromToken(totalSendValue.toString(), 18);
      } else {
        approveAmount = MAX_APPROVE_AMOUNT;
      }

      const isApproved = await approveTokenMultiSend(
        tokenAddress,
        approveAmount
      );
      setHasApproved(isApproved);
      setIsApproving(false);
    }
  };

  const handleApproveOptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const value = Number(e.target.value);
    setApproveOption(value);
  };

  const handleGetWalletAddress = async () => {
    const walletAddr = await getConnectedWallet();
    setWalletAddress(walletAddr);
  };

  const handleCheckAllowance = async () => {
    const isAllowed = await checkTokenAllowance(
      tokenAddress,
      "MULTISEND_TOKEN"
    );

    setHasApproved(isAllowed ?? false);
  };

  useEffect(() => {
    handleGetWalletAddress();
  }, []);

  useEffect(() => {
    if (!tokenAddress) return;
    handleCheckAllowance();
  }, [tokenAddress, handleCheckAllowance]);

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <form className="mt-5" onSubmit={handleSubmit(handleApproveMultiSend)}>
          <InputContainer>
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              type="text"
              placeholder="Ex. 0x..."
              {...register("tokenAddress")}
              name="tokenAddress"
              onChange={handleTokenAddressChange}
            />
          </InputContainer>
          {tokenAddress && (
            <div className="flex flex-col gap-y-2">
              <ItemInfo label="Name" content={tokenInfo?.name} />
              <ItemInfo label="Symbol" content={tokenInfo?.symbol} />
              <ItemInfo label="Decimals" content={tokenInfo?.decimals} />
              <ItemInfo
                label="Balance"
                content={formatNumberToCurrencyString(tokenInfo?.balance ?? 0)}
              />
            </div>
          )}
          <InputContainer className="mt-8">
            <Label htmlFor="allocation">Allocations</Label>
            <TextArea
              placeholder={
                "Insert allocation: separate with breaks line. By format: address, amount or address amount.\nEx.\n0x0000000000000000000000000000000000001000 10\n0x0000000000000000000000000000000000001000 13.5"
              }
              {...register("allocation")}
              name="allocation"
              onChange={handleAllocationChange}
              value={allocationInputValue}
            />
            <input
              type="file"
              onChange={handleSelectCsvFile}
              className="hidden"
              ref={fileInputRef}
              accept=".csv, text/csv"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="bg-none py-1 px-3 border border-grey rounded text-sm"
            >
              Or choose from CSV file
            </button>
            <button
              onClick={handleViewSampleFile}
              type="button"
              className="text-blue py-1 px-3 rounded text-sm"
            >
              Sample CSV file
            </button>
          </InputContainer>
          {showApproveContent && !hasApproved && (
            <>
              <p className="font-bold pb-2">Amount to approve:</p>
              <div className="flex items-center gap-x-2 mb-2">
                <input
                  type="radio"
                  id="unlimitedAmount"
                  name="approveAmount"
                  defaultChecked
                  value={APPROVE_AMOUNT_VALUE.unlimited}
                  onChange={handleApproveOptionChange}
                />
                <label htmlFor="unlimitedAmount">Unlimited amount</label>
              </div>
              <div className="flex items-center gap-x-2 mb-8">
                <input
                  type="radio"
                  id="exactAmount"
                  name="approveAmount"
                  value={APPROVE_AMOUNT_VALUE.limited}
                  onChange={handleApproveOptionChange}
                />
                <label htmlFor="exactAmount">
                  {`Exact amount (${totalSendValue} ${tokenInfo.symbol})`}
                </label>
              </div>
            </>
          )}
          <div className="flex justify-center">
            <PrimaryButton
              type="submit"
              disabled={!tokenAddress || !allocationInputValue || isApproving}
            >
              {hasApproved ? "Next" : "Approve"}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default memo(AddAllocation);

const APPROVE_AMOUNT_VALUE = {
  unlimited: 1,
  limited: 2,
};

export const MAX_APPROVE_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const ItemInfo = ({
  label,
  content,
}: {
  label: string;
  content: string | number | undefined;
}) => {
  return (
    <div className="flex justify-between">
      <p>{label}:</p>
      <p>{content ?? "--"}</p>
    </div>
  );
};
