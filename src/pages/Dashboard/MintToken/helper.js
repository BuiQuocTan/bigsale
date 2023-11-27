import * as Yup from "yup";
import { ethers } from "ethers";

Yup.addMethod(Yup.string, "checkAddress", function (errorMessage) {
  return this.test(`address`, errorMessage, function (value) {
    const { path, createError } = this;
    return (
      ethers.utils.isAddress(value) ||
      createError({ path, message: errorMessage })
    );
  });
});

export const standardValidationSchema = Yup.object().shape({
  tokenType: Yup.string().required("Token type is required"),
  tokenName: Yup.string().required("Token name is required"),
  tokenSymbol: Yup.string().required("Token symbol is required"),
  tokenDecimals: Yup.string().required("Token Decimals is required."),
  tokenSupply: Yup.number()
    .typeError("Token supply must be a number")
    .required("Token supply value is required"),
});

export const liquidityValidationSchema = Yup.object().shape({
  tokenType: Yup.string().required("Token type is required"),
  tokenName: Yup.string().required("Token name is required"),
  tokenSymbol: Yup.string().required("Token symbol is required"),
  tokenSupply: Yup.number()
    .typeError("Token supply must be a number")
    .required("Token supply value is required"),
  routerType: Yup.string().required("Router type is required"),
  generateYield: Yup.number()
    .typeError("Transaction fee to generate yield must be a number")
    .required("Generate yield is required"),
  generateLiquidity: Yup.number()
    .typeError("Transaction fee to generate liquidity must be a number")
    .required("Generate liquidity is required"),
  charityAddress: Yup.string()
    .required("Charity/Marketing address is required")
    .checkAddress("Address is invalid"),
  charityPercent: Yup.number()
    .typeError("Please enter a valid number")
    .required("Charity/Marketing percent is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100"),
});

export const babyTokenValidationSchema = Yup.object().shape({
  tokenType: Yup.string().required("Token type is required"),
  tokenName: Yup.string().required("Token name is required"),
  tokenSymbol: Yup.string().required("Token symbol is required"),
  tokenSupply: Yup.number()
    .typeError("Token supply must be a number")
    .required("Token supply value is required"),
  routerType: Yup.string().required("Router type is required"),
  rewardToken: Yup.string()
    .required("Reward token is required")
    .checkAddress("Address is invalid"),
  minimumToken: Yup.number()
    .typeError("Minimum token balance for dividends   must be a number")
    .required("Minimum token balance for dividends value is required")
    .test(
      "check-minimum",
      `Minimum token balance for dividends must be less than or equal 0.1% total supply`,
      function (val) {
        const tokenSupply = this.parent.tokenSupply;
        if (val && tokenSupply) {
          return val / tokenSupply <= 0.1;
        }
        return true;
      }
    ),
  tokenRewardFee: Yup.number()
    .typeError("Please enter a valid number")
    .required("Token reward fee is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100"),
  autoAddLid: Yup.number()
    .typeError("Please enter a valid number")
    .required("Auto add liquidity is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100"),
  marketingWallet: Yup.string()
    .required("Marketing wallet is required")
    .checkAddress("Address is invalid"),
  marketingFee: Yup.number()
    .typeError("Please enter a valid number")
    .required("Marketing fee is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100"),
});

export const buybackBabyTokenValidationSchema = Yup.object().shape({
  tokenType: Yup.string().required("Token type is required"),
  tokenName: Yup.string().required("Token name is required"),
  tokenSymbol: Yup.string().required("Token symbol is required"),
  tokenSupply: Yup.number()
    .typeError("Token supply must be a number")
    .required("Token supply value is required"),
  routerType: Yup.string().required("Router type is required"),
  rewardToken: Yup.string().required("Reward token is required"),
  liquidFee: Yup.number()
    .typeError("Please enter a valid number")
    .required("Liquidity fee is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100"),
  buybackFee: Yup.number()
    .typeError("Please enter a valid number")
    .required("Buy back fee is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100"),
  reflectionFee: Yup.number()
    .typeError("Please enter a valid number")
    .required("Reflection fee is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100"),
  marketingFee: Yup.number()
    .typeError("Please enter a valid number")
    .required("Marketing fee is required")
    .min(0, "Minimum at least 0")
    .max(100, "Allowed maximum is 100")
    .test(
      "check-total-percent",
      "Liquidity Fee + Buyback Fee + Reflection Fee + Marketing Fee must be less than 25%",
      function (val) {
        const liquidFee = this.parent.liquidFee;
        const buybackFee = this.parent.buybackFee;
        const reflectionFee = this.parent.reflectionFee;
        if (val && liquidFee && buybackFee && reflectionFee) {
          return (
            Number(liquidFee) +
              Number(buybackFee) +
              Number(reflectionFee) +
              Number(val) <
            25
          );
        }
        return true;
      }
    ),
});
