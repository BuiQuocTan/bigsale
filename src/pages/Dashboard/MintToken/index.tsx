import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppSelect, { IOptions } from "../../../components/common/AppSelect";
import { PrimaryButton } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import {
  Input,
  Label,
  InputContainer,
  InputError,
  InputHint,
} from "../../../components/common/Inputs";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Alert } from "../../../components/common/Alerts";
import { formatNumberToCurrencyString } from "../../../utils";
import { deployToken } from "../../../services/blockchainService";
import { CHAIN_INFO, CHAIN_SUPPORT } from "../../../utils/define";
import Swal from "sweetalert2";
import CopyToClipboard from "react-copy-to-clipboard";
import { customToast } from "../../../components/common/NotificationToast";
import {
  standardValidationSchema,
  liquidityValidationSchema,
  babyTokenValidationSchema,
  buybackBabyTokenValidationSchema,
} from "./helper";

const tokenTypeOptions: IOptions[] = [
  {
    label: "Standard Token",
    value: "Standard",
  },
  {
    label: "Liquidity Generator Token",
    value: "Liquidity",
  },
  {
    label: "Baby Token",
    value: "Baby",
  },
  {
    label: "Buyback Baby Token",
    value: "Buyback",
  },
];

const routerType: IOptions[] = [
  {
    label: "Pancakeswap",
    value: "Pancakeswap",
  },
  {
    label: "Pancakeswap Testnet",
    value: "PancakeswapTestnet",
  },
];
interface TokenInfo {
  totalSupply: number;
  name: number;
  symbol: string;
  decimals: string;
}

const MintToken = () => {
  const [tokenOption, setTokenOption] = useState<string>();
  const [routerAction, setRouterAction] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = useMemo(() => {
    if (tokenOption === "Standard") {
      return standardValidationSchema;
    } else if (tokenOption === "Liquidity") {
      return liquidityValidationSchema;
    } else if (tokenOption === "Baby") {
      return babyTokenValidationSchema;
    } else if (tokenOption === "Buyback") {
      return buybackBabyTokenValidationSchema;
    } else {
      return standardValidationSchema;
    }
  }, [tokenOption]);

  const formOptions = { resolver: yupResolver(validationSchema) };

  const routerOption = useMemo(() => {
    if (
      process.env.REACT_APP_BSC_RPC_URL ===
      "https://data-seed-prebsc-1-s3.binance.org:8545"
    ) {
      return routerType;
    } else {
      return routerType.splice(-1);
    }
  }, [routerType]);

  const {
    register,
    getValues,
    handleSubmit,
    setError,
    formState,
    control,
    reset,
  } = useForm(formOptions);

  const navigate = useNavigate();
  const { errors } = formState;

  const handleCreateStandardToken = async () => {
    const tokenDetails: TokenInfo = {
      name: getValues("tokenName"),
      symbol: getValues("tokenSymbol"),
      decimals: getValues("tokenDecimals"),
      totalSupply: getValues("tokenSupply"),
    };
    const receipt = await deployToken(tokenOption, {
      ...tokenDetails,
      charityAddress: "",
      taxFeeBps: "",
      liquidityFeeBps: "",
      charityFeeBps: "",
    });

    if (receipt) {
      handleForm({
        ...tokenDetails,
        contractAddress: receipt.contractAddress,
        transactionHash: receipt.transactionHash,
      });
    }
  };

  const handleCreateLiquidityToken = async () => {
    const tokenDetails: TokenInfo = {
      name: getValues("tokenName"),
      symbol: getValues("tokenSymbol"),
      decimals: "18",
      totalSupply: getValues("tokenSupply"),
    };

    const receipt = await deployToken(tokenOption, {
      ...tokenDetails,
      taxFeeBps: getValues("generateYield"),
      liquidityFeeBps: getValues("generateLiquidity"),
      charityAddress: getValues("charityAddress"),
      charityFeeBps: getValues("charityPercent"),
    });

    if (receipt) {
      handleForm({
        ...tokenDetails,
        contractAddress: receipt.contractAddress,
        transactionHash: receipt.transactionHash,
      });
    }
  };

  const handleCreateBabyToken = async () => {
    const tokenDetails: TokenInfo = {
      name: getValues("tokenName"),
      symbol: getValues("tokenSymbol"),
      decimals: "18",
      totalSupply: getValues("tokenSupply"),
    };

    const receipt = await deployToken(tokenOption, {
      ...tokenDetails,
      rewardAddress: getValues("rewardToken"),
      marketingAddress: getValues("marketingWallet"),
      minimumTokenBalance: getValues("minimumToken"),
      rewardsFee: getValues("tokenRewardFee"),
      liquidityFee: getValues("autoAddLid"),
      marketingFee: getValues("marketingFee"),
    });

    if (receipt) {
      handleForm({
        ...tokenDetails,
        contractAddress: receipt.contractAddress,
        transactionHash: receipt.transactionHash,
      });
    }
  };

  const handleCreateBuyBackBabyToken = async () => {
    const tokenDetails: TokenInfo = {
      name: getValues("tokenName"),
      symbol: getValues("tokenSymbol"),
      decimals: "18",
      totalSupply: getValues("tokenSupply"),
    };

    const receipt = await deployToken(tokenOption, {
      ...tokenDetails,
      liquidityFee: getValues("liquidFee"),
      buybackFee: getValues("buybackFee"),
      reflectionFee: getValues("reflectionFee"),
      marketingFee: getValues("marketingFee"),
      rewardAddress: getValues("rewardToken"),
    });

    if (receipt) {
      handleForm({
        ...tokenDetails,
        contractAddress: receipt.contractAddress,
        transactionHash: receipt.transactionHash,
      });
    }
  };

  const handleMintToken: SubmitHandler<any> = async () => {
    setIsLoading(true);
    if (tokenOption === "Standard") {
      await handleCreateStandardToken();
    } else if (tokenOption === "Liquidity") {
      await handleCreateLiquidityToken();
    } else if (tokenOption === "Baby") {
      await handleCreateBabyToken();
    } else if (tokenOption === "Buyback") {
      await handleCreateBuyBackBabyToken();
    } else if (tokenOption === undefined){
      await handleCreateStandardToken();
    }

    setIsLoading(false);
  };

  const handleForm = async (value: {
    totalSupply: number;
    name: number;
    symbol: string;
    decimals: string;
    contractAddress: string;
    transactionHash: string;
  }) => {
    await Alert({
      width: 750,
      title: "Token Created Successfully!",
      message: (
        <>
          <div className="py-5 space-y-2">
            <p className="flex justify-between">
              Name: <span>{value.name}</span>
            </p>
            <p className="flex justify-between">
              Decimal: <span>{value.decimals}</span>
            </p>
            <p className="flex justify-between">
              Total Supply:
              <span>
                {formatNumberToCurrencyString(value.totalSupply)}{" "}
                {value.symbol || 18}
              </span>
            </p>
            <p className="flex justify-between">
              Address: <span>{value.contractAddress}</span>
            </p>
          </div>
          <div className="flex justify-content gap-x-2 py-5">
            <button
              className="bg-none py-2 border border-gray-white rounded w-44"
              onClick={() =>
                window.open(
                  `${CHAIN_INFO[CHAIN_SUPPORT.bsc].baseNetworkUrl.testnet}/tx/${
                    value.transactionHash
                  }`
                )
              }
            >
              View transaction
            </button>
            <CopyToClipboard
              onCopy={() =>
                customToast({ message: "Address Copied", duration: 2000 })
              }
              text={value.contractAddress}
            >
              <button className="bg-none py-2 border border-gray-white rounded w-44">
                Copy address
              </button>
            </CopyToClipboard>
            <button
              className="bg-none py-2 border border-gray-white rounded w-44"
              onClick={() => {
                Swal.close();
                navigate(`/app/launchpad/create/${value.contractAddress}`);
              }}
            >
              Create launchpad
            </button>
            <button
              className="bg-none py-2 border border-gray-white rounded w-44"
              onClick={() => {
                Swal.close();
                navigate(`/app/fairlaunch/create/${value.contractAddress}`);
              }}
            >
              Create Fairlaunch
            </button>
          </div>
        </>
      ),
      showConfirmButton: false,
      showCloseButton: true,
      confirmButtonText: "",
    });

    reset();
  };

  return (
    <div>
      <div className="text-center font-bold text-3xl py-10">
        <h3>Create Token</h3>
      </div>
      <div className="max-w-xl mx-auto">
        <Card>
          <form className="mt-5" onSubmit={handleSubmit(handleMintToken)}>
            <InputContainer>
              <Label htmlFor="tokenType">Token Type</Label>
              <Controller
                control={control}
                name="tokenType"
                defaultValue={tokenTypeOptions[0].value}
                render={({ field: { onChange, value, ref } }) => (
                  <AppSelect
                    inputRef={ref}
                    options={tokenTypeOptions}
                    value={tokenTypeOptions.find((c) => c.value === value)}
                    onChange={(val) => {
                      setTokenOption(val.value);
                      onChange(val.value);
                    }}
                    placeholder="Select Token Type"
                    isSearchable={false}
                  />
                )}
              />
              <InputError>{errors.tokenType?.message}</InputError>
              <InputHint>
                Fee: {tokenOption === "Liquidity" ? "0.3 BNB" : "0.1 BNB"}
              </InputHint>
            </InputContainer>
            <InputContainer>
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                type="text"
                placeholder="Ex. Astronaut"
                {...register("tokenName")}
                name="tokenName"
              />
              <InputError>{errors.tokenName?.message}</InputError>
            </InputContainer>

            <InputContainer>
              <Label htmlFor="tokenSymbol">Token Symbol</Label>
              <Input
                type="text"
                placeholder="Ex. NAUT"
                {...register("tokenSymbol")}
                name="tokenSymbol"
              />
              <InputError>{errors.tokenSymbol?.message}</InputError>
            </InputContainer>

            {Boolean(!tokenOption || tokenOption === "Standard") && (
              <InputContainer>
                <Label htmlFor="tokenDecimals">Token Decimals</Label>
                <Input
                  type="number"
                  placeholder="Ex. 18"
                  {...register("tokenDecimals")}
                  name="tokenDecimals"
                />
                <InputError>{errors.tokenDecimals?.message}</InputError>
              </InputContainer>
            )}

            <InputContainer>
              <Label htmlFor="tokenSupply">Total Supply</Label>
              <Input
                type="number"
                placeholder="Ex. 32000000"
                {...register("tokenSupply")}
                name="tokenSupply"
              />
              <InputError>{errors.tokenSupply?.message}</InputError>
            </InputContainer>

            {Boolean(tokenOption && tokenOption !== "Standard") && (
              <InputContainer>
                <Label htmlFor="routerType">Router</Label>
                <Controller
                  control={control}
                  name="routerType"
                  defaultValue={routerOption[0].value}
                  render={({ field: { onChange, value, ref } }) => (
                    <AppSelect
                      options={routerOption}
                      value={routerOption.find((c) => c.value === value)}
                      onChange={(val) => {
                        setRouterAction(val.value);
                        onChange(val.value);
                      }}
                      placeholder="Select Router Exchange"
                      isSearchable={false}
                    />
                  )}
                />
                <InputError>{errors?.routerType?.message}</InputError>
              </InputContainer>
            )}

            {tokenOption === "Liquidity" && (
              <div>
                <InputContainer>
                  <Label htmlFor="generateYield">
                    Transaction fee to generate yield (%)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex. 2"
                    {...register("generateYield")}
                    name="generateYield"
                  />
                  <InputError>{errors.generateYield?.message}</InputError>
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="generateLiquidity">
                    Transaction fee to generate liquidity (%)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex. 2"
                    {...register("generateLiquidity")}
                    name="generateLiquidity"
                  />
                  <InputError>{errors.generateLiquidity?.message}</InputError>
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="charityAddress">
                    Charity/Marketing address
                  </Label>
                  <Input
                    type="string"
                    placeholder="Ex: 0x"
                    {...register("charityAddress")}
                    name="charityAddress"
                  />
                  <InputError>{errors?.charityAddress?.message}</InputError>
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="charityPercent">
                    Charity/Marketing percent (%)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0 - 25"
                    {...register("charityPercent")}
                    name="charityPercent"
                  />
                  <InputError>{errors?.charityPercent?.message}</InputError>
                </InputContainer>
              </div>
            )}

            {(tokenOption === "Baby" || tokenOption === "Buyback") && (
              <InputContainer>
                <Label>Reward token</Label>
                <Input
                  type="string"
                  placeholder="Ex: 0x..."
                  {...register("rewardToken")}
                  name="rewardToken"
                />
                <InputError>{errors?.rewardToken?.message}</InputError>
                <InputHint>
                  If you want to reward DOGE, please enter
                  0xba2ae424d960c26247dd6c32edc70b295c744c43.
                </InputHint>
              </InputContainer>
            )}

            {tokenOption === "Baby" && (
              <div>
                <InputContainer>
                  <Label>Minimum token balance for dividends</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 10000000"
                    {...register("minimumToken")}
                    name="minimumToken"
                  />
                  <InputError>{errors?.minimumToken?.message}</InputError>
                  <InputHint>
                    Min hold each wallet must be over $50 to receive rewards.
                  </InputHint>
                </InputContainer>

                <InputContainer>
                  <Label>Token reward fee (%)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    {...register("tokenRewardFee")}
                    name="tokenRewardFee"
                  />
                  <InputError>{errors?.tokenRewardFee?.message}</InputError>
                </InputContainer>

                <InputContainer>
                  <Label>Auto add liquidity (%)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    {...register("autoAddLid")}
                    name="autoAddLid"
                  />
                  <InputError>{errors?.autoAddLid?.message}</InputError>
                </InputContainer>

                <InputContainer>
                  <Label>Marketing wallet</Label>
                  <Input
                    type="string"
                    placeholder="Ex: 0x..."
                    {...register("marketingWallet")}
                    name="marketingWallet"
                  />
                  <InputError>{errors?.marketingWallet?.message}</InputError>
                </InputContainer>
              </div>
            )}

            {tokenOption === "Buyback" && (
              <div>
                <InputContainer>
                  <Label>Liquidity Fee (%)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    {...register("liquidFee")}
                    name="liquidFee"
                  />
                  <InputError>{errors?.liquidFee?.message}</InputError>
                </InputContainer>

                <InputContainer>
                  <Label>Buyback Fee (%)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    {...register("buybackFee")}
                    name="buybackFee"
                  />
                  <InputError>{errors?.buybackFee?.message}</InputError>
                </InputContainer>

                <InputContainer>
                  <Label>Reflection Fee (%)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    {...register("reflectionFee")}
                    name="reflectionFee"
                  />
                  <InputError>{errors?.reflectionFee?.message}</InputError>
                </InputContainer>
              </div>
            )}

            {(tokenOption === "Buyback" || tokenOption === "Baby") && (
              <InputContainer>
                <Label>Marketing fee (%)</Label>
                <Input
                  type="number"
                  placeholder="0-100"
                  {...register("marketingFee")}
                  name="marketingFee"
                />
                <InputError>{errors?.marketingFee?.message}</InputError>
              </InputContainer>
            )}

            <InputContainer className="text-center">
              <PrimaryButton disabled={isLoading} type="submit">
                Mint Token
              </PrimaryButton>
            </InputContainer>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default MintToken;

const ACTION_OPTION = {
  viewTransaction: 1,
  createLaunchpad: 2,
  createFairlaunch: 3,
};
