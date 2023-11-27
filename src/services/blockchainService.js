import BlockchainInstance from "../blockchain/bsc";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { BigNumber, ethers, providers } from "ethers";
import { BSC_CONTRACT_ADDRESS } from "../utils/define";
import {
  getNumberFromBN,
  getTokenNumberFromBN,
  getUTCTimestamp,
  getBNFromToken,
  makeString,
} from "../utils";

import axios from "axios";
import {
  getLaunchpadDetailAPI,
  getLaunchpadListAPI,
  getReceiptFromIPFS,
} from "../api/common";
import _ from "lodash";
import { Action } from "../pages/Dashboard/LaunchPad/Lists/demo-data";

const {
  LiquidityTokenAbi,
  StandardTokenAbi,
  TokenAbi,
  TokenLockAbi,
  LiquidityTokenByteCode,
  StandardTokenByteCode,
  DeployerAbi,
  LaunchPadAbi,
  ManageTokenAbi,
  MultiSendTokenAbi,
  DeployerInstance,
  getLaunchpadInstance,
  getTokenInstance,
  BabyTokenAbi,
  BabyTokenByteCode,
  BuyBackBabyTokenAbi,
  BuyBackBabyTokenByteCode,
} = BlockchainInstance;
let globalProvider;
let globalWalletAddr;

const getTokenContractInstance = async (
  tokenAddress,
  walletType,
  walletProvider
) => {
  if (walletType === "WALLET_CONNECT") {
    if (!globalProvider)
      globalProvider = new providers.Web3Provider(walletProvider);

    let signer = globalProvider.getSigner(0);

    return new ethers.Contract(tokenAddress, TokenAbi, signer);
  } else {
    if (!globalProvider)
      globalProvider = new ethers.providers.Web3Provider(window.ethereum);
    let signer = globalProvider.getSigner(0);
    return new ethers.Contract(tokenAddress, TokenAbi, signer);
  }
};

export const finishTokenSale = async (
  type,
  address,
  walletType,
  walletProvider
) => {
  try {
    const contractInstance = await launchpadContractInstance(
      address,
      walletType,
      walletProvider
    );

    let tx;

    switch (type) {
      case "CANCEL":
        tx = await contractInstance.cancelSale();
        break;
      case "FINISH":
        tx = await contractInstance.finishSale();
        break;
      case "CLAIM":
        tx = await contractInstance.claim();
    }

    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const getLaunchpadMediaInfo = async (launchpad) => {
  const {
    launchpad: address,
    user: owner,
    tokenSale,
    tokenPayment,
    uriData,
    launchPadType: launchpadType,
    presaleRate,
    listingRate,
    startTime: startDate,
    endTime: endDate,
    claimTime: claimDate,
    status,
    minBuyPerParticipant,
    maxBuyPerParticipant,
    totalRaised,
    refundWhenFinish,
    usingWhitelist,
    endOfWhitelistTime,
    whitelistUsers,
  } = launchpad;
  const ercContract = await createStandardContract(tokenSale);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    ercContract.name(),
    ercContract.symbol(),
    ercContract.decimals(),
    ercContract.totalSupply(),
  ]);
  let receipt = { data: {} };
  try {
    // receipt = await getReceiptFromIPFS(uriData.split("/").pop());
    receipt = await axios.get(uriData, {timeout: 5000})
    // receipt = await axios.get(uriData.replace("https://gateway.pinata.cloud", "https://ipfs.io"), {timeout: 5000})
  } catch (error) {
    console.error("Fetch receipt:", error);
  }

  const { campaignData: {
    description,
    discord,
    facebook,
    github,
    logo,
    reddit,
    telegram,
    twitter,
    youtube,
    updates,
    website,
  } } = receipt.data;
  const softCap =
    launchpadType === 0
      ? getTokenNumberFromBN(BigNumber.from(launchpad.softcap))
      : getTokenNumberFromBN(BigNumber.from(launchpad.hardcap));
  const hardCap =
    launchpadType === 0
      ? getTokenNumberFromBN(BigNumber.from(launchpad.hardcap))
      : "0";
  const minBuy = getTokenNumberFromBN(BigNumber.from(minBuyPerParticipant));
  const maxBuy = getTokenNumberFromBN(BigNumber.from(maxBuyPerParticipant));
  const totalDeposits = getTokenNumberFromBN(BigNumber.from(totalRaised));
  const totalNeedToRaised = getTokenNumberFromBN(
    BigNumber.from(launchpad.totalNeedToRaised)
  );
  const adminTokenSaleFee = getTokenNumberFromBN(
    BigNumber.from(launchpad.adminTokenSaleFee)
  );
  const tokenForPresale = getTokenNumberFromBN(
    BigNumber.from(launchpad.hardcap).mul(BigNumber.from(presaleRate))
  );
  const action =
    usingWhitelist &&
    (endOfWhitelistTime === 0 || Date.now() < endOfWhitelistTime)
      ? Action.Whitelist
      : Action.Public;

  let newData = {
    totalSellingAmount: tokenForPresale,
    claimDate,
    tokenForPresale,
    description,
    discord,
    youtube,
    facebook,
    github,
    logo,
    reddit,
    telegram,
    twitter,
    updates,
    website,
    owner,
    name,
    symbol,
    decimals,
    logo,
    presaleRate,
    listingRate,
    softCap,
    hardCap,
    progress:
      launchpadType === 0
        ? (totalDeposits * 100) / Number(hardCap)
        : (totalDeposits * 100) / Number(softCap),
    startDate,
    endDate,
    tokenAddr: tokenSale,
    totalSupply: getTokenNumberFromBN(totalSupply, decimals),
    totalDeposits,
    totalNeedToRaised,
    adminTokenSaleFee,
    launchpadAddr: address,
    owner,
    status: parseInt(status),
    liquidity: 0,
    minBuy,
    maxBuy,
    tokenPaymentAddr: tokenPayment,
    refundWhenFinished: refundWhenFinish === "true",
    launchpadType,
    usingWhitelist,
    endOfWhitelistTime,
    action,
    whitelistUsers,
  };
  return newData;
};

export const getLaunchpadInfoByAddress = async (address) => {
  try {
    const {
      data: { launchpad },
    } = await getLaunchpadDetailAPI(address);
    return getLaunchpadMediaInfo(launchpad);
  } catch (error) {
    console.error("getLaunchpadInfoByAddress", error);
  }
};

export const claimTokenFund = async (
  launchpadAddress,
  walletType,
  walletProvider
) => {
  try {
    let contractInstance = await launchpadContractInstance(
      launchpadAddress,
      walletType,
      walletProvider
    );

    let tx = await contractInstance.claimFund();

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const claimTokenRefund = async (
  launchpadAddress,
  walletType,
  walletProvider
) => {
  try {
    let contractInstance = await launchpadContractInstance(
      launchpadAddress,
      walletType,
      walletProvider
    );

    let tx = await contractInstance.claimRefund();

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const checkClaimedLaunchpad = async (
  launchpadAddr,
  tokenRate,
  launchpadType,
  decimals
) => {
  try {
    let contractInstance = await getLaunchpadInstance(launchpadAddr);
    let amountToClaim;
    if (launchpadType === 0) {
      amountToClaim = await contractInstance.earnedAmount(globalWalletAddr);
      return getTokenNumberFromBN(amountToClaim, decimals);
    } else {
      amountToClaim = await contractInstance.depositedAmount(globalWalletAddr);
      const rate = getBNFromToken(tokenRate.toFixed(9), 9);
      return getTokenNumberFromBN(amountToClaim.mul(rate), 27);
    }
  } catch (error) {
    console.log(error);
    return "0";
  }
};

export const buyToken = async (
  _amount,
  tokenPaymentAddr,
  launchpadAddress,
  walletType,
  walletProvider
) => {
  try {
    let contractInstance = await launchpadContractInstance(
      launchpadAddress,
      walletType,
      walletProvider
    );

    const value = ethers.utils.parseUnits(_amount, "ether");
    let tx = await contractInstance.invest(value, {
      value:
        tokenPaymentAddr === process.env.REACT_APP_BSC_CONTRACT_ADDR_TOKEN_BNB
          ? value
          : null,
    });

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const getUserContributions = async () => {
  try {
    let contributions = await DeployerInstance.getUserContributions(
      globalWalletAddr
    );

    return contributions;
  } catch (error) {
    console.log(error, "getUserContributions");
  }
};

export const getLaunchPadContribution = async (
  launchpadAddr,
  walletType,
  walletProvider
) => {
  try {
    const contractInstance = await launchpadContractInstance(
      launchpadAddr,
      walletType,
      walletProvider
    );
    const contributions = await contractInstance.getContributorsList();

    return contributions;
  } catch (error) {
    console.log(error, "getLaunchPadContribution");
  }
};

export const getLaunchpadDetails = async ({ filter, page, size }) => {
  try {
    let allFilter = { filter, page, size };
    allFilter = _.pickBy(allFilter);
    if (allFilter.filter) {
      allFilter.filter = _.pickBy(allFilter.filter);
    }
    let {
      data: { totalItems, launchpads, totalPages, currentPage },
    } = await getLaunchpadListAPI(allFilter);
    try {
      launchpads = await Promise.all(launchpads.map(getLaunchpadMediaInfo));
    } catch (error) {
      console.log(error);
      totalItems = 0;
      launchpads = [];
      totalPages = 0;
      currentPage = 0;
    }
    return { totalItems, launchpads, totalPages, currentPage };
  } catch (error) {
    console.log(error, "launchpadDetails");
    return {};
  }
};

export const checkTokenAllowance = async (tokenAddress, _operator) => {
  try {
    if (tokenAddress === process.env.REACT_APP_BSC_CONTRACT_ADDR_TOKEN_BNB)
      return true;
    let operator = "";
    switch (_operator) {
      case "DEPLOYER":
        operator = BSC_CONTRACT_ADDRESS.DEPLOYER;
        break;
      case "LOCKER":
        operator = BSC_CONTRACT_ADDRESS.TOKEN_LOCK;
        break;
      case "AIRDROP":
        operator = BSC_CONTRACT_ADDRESS.AIRDROP;
        break;
      case "MULTISEND_TOKEN":
        operator = BSC_CONTRACT_ADDRESS.TOKEN_MULTISEND;
        break;
      default:
        operator = _operator;
        break;
    }
    let tokenInstance = getTokenInstance(tokenAddress);

    let receipt = await tokenInstance.allowance(globalWalletAddr, operator);

    return receipt > 0;
  } catch (error) {
    console.error(error, "checkAllowance");
  }
};

export const approveTokenDeployer = async (
  tokenAddress,
  walletType,
  walletProvider
) => {
  try {
    let instance = await getTokenContractInstance(
      tokenAddress,
      walletType,
      walletProvider
    );

    let operator = BSC_CONTRACT_ADDRESS.DEPLOYER;

    let tx = await instance.approve(
      operator,
      "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      { gasLimit: 100000 }
    );

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error, "approveDeployer");
  }
};

export const approveTokenLaunchpad = async (
  tokenAddress,
  launchpadAddress,
  walletType,
  walletProvider
) => {
  try {
    let instance = await getTokenContractInstance(
      tokenAddress,
      walletType,
      walletProvider
    );

    let tx = await instance.approve(
      launchpadAddress,
      "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      { gasLimit: 100000 }
    );

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error, "approveLaunchpad");
  }
};

export const getConnectedWallet = async () => {
  if (!window.localStorage.getItem("dotLaunch_userAddress")) return "";
  const accounts = await ethereum.request({ method: "eth_accounts" });
  if (accounts.length) {
    return accounts[0];
  }
  return "";
};

export const connectMetamask = async () => {
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (chainId !== "0x61") {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x61" }],
      });
    }

    globalWalletAddr = accounts[0];
    window.localStorage.setItem("dotLaunch_userAddress", globalWalletAddr);
    return globalWalletAddr;
  } catch (error) {
    console.error(error);
    return "";
  }
};

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    globalProvider = null;
    console.log("accountsChanged");
    window.location.reload();
  });

  window.ethereum.on("chainChanged", (_chainId) => {
    globalProvider = null;
    console.log("chainChanged");
    window.location.reload();
  });
}

const createStandardContract = async (addr) => {
  let tokenContract;

  if (!globalWalletAddr) {
    globalWalletAddr = await getConnectedWallet();
    if (!globalWalletAddr) {
      await connectMetamask();
    }
  }

  if (!globalProvider) {
    globalProvider = new providers.Web3Provider(web3.currentProvider);
  }

  tokenContract = connectContract(StandardTokenAbi, addr);

  if (!tokenContract) {
    return null;
  }

  let signer = await globalProvider.getSigner();

  if (signer) {
    try {
      tokenContract = await tokenContract.connect(signer);
    } catch (error) {
      console.error("Token lock connect error");
    }
  } else {
    return null;
  }

  return tokenContract;
};

export const isValidAddress = (addr) => ethers.utils.isAddress(addr);

const connectContract = (tokenabi, tokenAddr, signer) => {
  try {
    if (!globalProvider) {
      globalProvider = new providers.Web3Provider(web3.currentProvider);
    }
    return new ethers.Contract(tokenAddr, tokenabi, signer || globalProvider);
  } catch (error) {
    console.log(error);
    return null;
  }
};

const createLockContract = async () => {
  let tokenContract;

  if (!globalProvider) {
    return null;
  }

  tokenContract = connectContract(
    TokenLockAbi,
    BSC_CONTRACT_ADDRESS.TOKEN_LOCK
  );

  if (!tokenContract) {
    return null;
  }

  return tokenContract;
};

const createManageContract = async () => {
  let manageContract;

  if (!globalProvider || !globalWalletAddr) {
    return null;
  }

  manageContract = await connectContract(
    ManageTokenAbi,
    BSC_CONTRACT_ADDRESS.TOKEN_MANAGE
  );

  if (!manageContract) {
    return null;
  }

  let signer = await globalProvider.getSigner();

  if (signer) {
    try {
      manageContract = await manageContract.connect(signer);
      return manageContract;
    } catch (error) {
      console.log(error, "createManageContract");
    }
  } else {
    return null;
  }
};

export const getUserBalance = async (userAddress) => {
  try {
    let receipt = await globalProvider.getBalance(userAddress);
    return receipt;
  } catch (error) {
    console.log(error, "getUserBalance");
  }
};

export const getStandardTokenBalance = async (tokenAddress, ownerAddress) => {
  /*
  if (!globalWalletAddr) {
    globalWalletAddr = await getConnectedWallet();
    if (!globalWalletAddr) {
      await connectMetamask();
    }
  }
  */

  if (!globalProvider) {
    globalProvider = new providers.Web3Provider(web3.currentProvider);
  }

  /*
  try {
    accountbalance = await globalProvider.getBalance(globalWalletAddr);
  } catch (error) {
    console.error("Check account status");
    return;
  }


  try {
    await globalProvider.getCode(tokenAddress);
  } catch (error) {
    console.log("Invalid Token Address", error);
    return;
  }
  */

  const [ercContract /*, lockContract*/] = await Promise.all([
    createStandardContract(tokenAddress),
    // createLockContract(),
  ]);

  if (!ercContract) {
    //|| !lockContract) {
    return;
  }

  let calc_balance;
  // let calc_lockallow, calc_lockedamount, calc_totalSupply;
  // let calc_lockedamount, calc_totalSupply;
  try {
    const [
      decimals,
      totalSupply,
      balance,
      // available,
      tsymbol,
      tname,
      // lockedamount,
      // tunlocktime,
    ] = await Promise.all([
      ercContract.decimals(),
      ercContract.totalSupply(),
      // ercContract.balanceOf(globalWalletAddr),

      // TODO: replace with globalWalletAddr and remove ownerAddress
      ownerAddress ? ercContract.balanceOf(ownerAddress) : 0,

      // ercContract.allowance(globalWalletAddr, BSC_CONTRACT_ADDRESS.TOKEN_LOCK),
      ercContract.symbol(),
      ercContract.name(),
      // lockContract.GetBalance(tokenAddress),
      // lockContract.GetUnlockTime(tokenAddress),
    ]);

    // const date = new Date(tunlocktime.toNumber() * 1000);

    // calc_totalSupply = ethers.utils.formatUnits(totalSupply, decimals);
    calc_balance = ethers.utils.formatUnits(balance, decimals);
    // calc_lockallow = ethers.utils.formatUnits(available, decimals);
    // calc_lockedamount = ethers.utils.formatUnits(lockedamount, decimals);

    return {
      calc_totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      calc_balance,
      // calc_lockallow,
      // calc_lockedamount: ethers.utils.formatUnits(lockedamount, decimals),
      // tunlocktime: date.toLocaleString("en-GB"),
      tname,
      tsymbol,
      decimals,
    };
  } catch (error) {
    console.log("Get Information Error", error);
    return;
  }
};

export const disconnectMetamask = () => {
  window.localStorage.removeItem("dotLaunch_userAddress");
  globalWalletAddr = null;
};

export const connectWalletConnect = async () => {
  try {
    const provider = new WalletConnectProvider({
      rpc: {
        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      },
      chainId: 97,
      infuraId: null,
    });

    await provider.enable();
    const web3 = new Web3(provider);

    const accounts = await web3.eth.getAccounts();
    return accounts;
  } catch (error) {
    console.log(error);
  }
};

const disconnectWallet = async () => {
  if (walletType === "WALLET_CONNECT") {
    const provider = new WalletConnectProvider({
      rpc: {
        // 56: "https://bsc-dataseed1.ninicoin.io/",

        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      },
      chainId: 97,
      infuraId: null,
    });
    await provider.disconnect();
  }

  store.remove("userLaunchpads");
};

const getSigner = async (walletType, walletProvider) => {
  if (walletType === "WALLET_CONNECT") {
    const web3Provider = new providers.Web3Provider(walletProvider);
    return web3Provider.getSigner(0);
  } else {
    let newProvider = new ethers.providers.Web3Provider(window.ethereum);
    return newProvider.getSigner(0);
  }
};

export const getTokenAddresses = async () => {
  if (!globalWalletAddr) {
    console.error("Wallet is unconnected");
    return;
  }

  const manage_contract = await createManageContract();

  if (!manage_contract) {
    return;
  }

  try {
    const tokenlists = await manage_contract.getCreatedToken(globalWalletAddr);
    const tokenDetails = await Promise.all([
      tokenlists.map(getStandardTokenBalance),
    ]);

    return tokenDetails;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const deployToken = async (type, params, walletType, walletProvider) => {
  if (type === undefined) {
    type = "Standard";
  }
  try {
    const signer = await getSigner(walletType, walletProvider);
    let abi;
    let bytecode;
    let args;
    let {
      name,
      symbol,
      decimals,
      totalSupply,
      // charityAddress,
      // taxFeeBps,
      // liquidityFeeBps,
      // charityFeeBps,
    } = params;

    if (type === "Standard") {
      abi = StandardTokenAbi;
      bytecode = StandardTokenByteCode;
      args = [
        name,
        symbol,
        decimals,
        ethers.utils.parseUnits(totalSupply, decimals),
      ];
    } else if (type === "Liquidity") {
      abi = LiquidityTokenAbi;
      bytecode = LiquidityTokenByteCode;
      let { charityAddress, taxFeeBps, liquidityFeeBps, charityFeeBps } =
        params;
      args = [
        name,
        symbol,
        ethers.utils.parseUnits(totalSupply, 18),
        "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
        charityAddress,
        ethers.utils.parseUnits(taxFeeBps, 2),
        ethers.utils.parseUnits(liquidityFeeBps, 2),
        ethers.utils.parseUnits(charityFeeBps, 2),
      ];
    } else if (type === "Baby") {
      abi = BabyTokenAbi;
      bytecode = BabyTokenByteCode;
      let {
        rewardAddress,
        marketingAddress,
        minimumTokenBalance,
        rewardsFee,
        liquidityFee,
        marketingFee,
      } = params;
      args = [
        name,
        symbol,
        ethers.utils.parseUnits(totalSupply, 18),
        [
          rewardAddress,
          "0xd99d1c33f9fc3444f8101754abc46c52416550d1",
          marketingAddress,
          "0x6d78a4a7f840c09fdf5af422a4fbdfa99e250bee",
        ],
        [rewardsFee, liquidityFee, marketingFee],
        minimumTokenBalance,
      ];
    } else if (type === "Buyback") {
      abi = BuyBackBabyTokenAbi;
      bytecode = BuyBackBabyTokenByteCode;
      let {
        liquidityFee,
        buybackFee,
        reflectionFee,
        marketingFee,
        rewardAddress,
      } = params;

      liquidityFee = ethers.utils.parseUnits(liquidityFee, 2);
      buybackFee = ethers.utils.parseUnits(buybackFee, 2);
      reflectionFee = ethers.utils.parseUnits(reflectionFee, 2);
      marketingFee = ethers.utils.parseUnits(marketingFee, 2);
      args = [
        name,
        symbol,
        ethers.utils.parseUnits(totalSupply, 18),
        rewardAddress,
        "0xd99d1c33f9fc3444f8101754abc46c52416550d1",
        [liquidityFee, buybackFee, reflectionFee, marketingFee, 10000],
      ];
    }

    // The factory we use for deploying contracts
    const factory = new ethers.ContractFactory(abi, bytecode, signer);

    const value = ethers.utils.parseUnits("0.01", "ether");

    // Deploy an instance of the contract
    const contract = await factory.deploy(
      ...args,
      "0x153B202F6C6e570f13C27371CdA6Ae2c8768Dca6",
      value,
      { value }
    );

    const receipt = await contract.deployTransaction.wait();
    console.log("finish", receipt);

    return receipt;
  } catch (error) {
    console.log("Deploy token error", error);
  }
};

const deployerContractInstance = async (walletType, walletProvider) => {
  const signer = await getSigner(walletType, walletProvider);

  return new ethers.Contract(
    BSC_CONTRACT_ADDRESS.DEPLOYER,
    DeployerAbi,
    signer
  );
};

const launchpadContractInstance = async (
  launchpadAddr,
  walletType,
  walletProvider
) => {
  const signer = await getSigner(walletType, walletProvider);

  return new ethers.Contract(launchpadAddr, LaunchPadAbi, signer);
};

export const signIn = async (walletType, walletProvider) => {
  try {
    const message = makeString(50)
    const signer = await getSigner(walletType, walletProvider);
    const signature = await signer.signMessage(message)
    return {
      address: await signer.provider.getSigner(0).getAddress(),
      network: signer.provider.network.chainId.toString(),
      nonce: message,
      signature
    }
  } catch (error) {
    console.error(error)
  }
}

export const createTokenLaunchpad = async (
  launchpadDetails,
  walletType,
  walletProvider
) => {
  try {
    const instance = await deployerContractInstance(walletType, walletProvider);

    const {
      presaleRate,
      listingRate,
      softCap,
      hardCap,
      minBuy,
      maxBuy,
      startDate,
      endDate,
      // tokenPaymentFee,
      // tokenSaleFee,
      // liquidityPerc,
      claimDate,
      tokenDecimals,
      feeOption,
      remainingTokenOption,
      infoUrl,
      tokenSaleAddr,
      tokenPaymentAddr,
      launchpadType,
      totalSellingAmount,
      // refundWhenFinished,
    } = launchpadDetails;

    const _prices =
      launchpadType === 0
        ? [Number(presaleRate), Number(listingRate || 0)]
        : [totalSellingAmount / Number(softCap), 0];

    const _caps =
      launchpadType === 0
        ? [
            ethers.utils.parseUnits(softCap, tokenDecimals || 18),
            ethers.utils.parseUnits(hardCap, tokenDecimals || 18),
          ]
        : [0, ethers.utils.parseUnits(softCap, tokenDecimals || 18)];

    const _limits =
      launchpadType === 0
        ? [
            ethers.utils.parseUnits(minBuy, "ether"),
            ethers.utils.parseUnits(maxBuy, "ether"),
          ]
        : [0, 0];

    const _times = [
      getUTCTimestamp(startDate),
      getUTCTimestamp(endDate),
      getUTCTimestamp(claimDate),
    ];

    const _adminFee = feeOption === "2" ? [200, 200] : [0, 500];
    const _addr = [tokenSaleAddr, tokenPaymentAddr];
    const refundWhenFinished = remainingTokenOption === "2" ? false : true;
    console.log(
      {
        _caps,
        _times,
        _prices,
        _limits,
        _adminFee,
        _addr,
        infoUrl,
        refundWhenFinished,
        launchpadType,
      },
      "tokens needed"
    );

    const value = ethers.utils.parseUnits("0.01", "ether");

    const tx = await instance.createLaunchpad(
      _caps,
      _times,
      _prices,
      _limits,
      _adminFee,
      _addr,
      infoUrl,
      // tokenSaleAddr,
      // tokenPaymentAddr, // BNB by default
      refundWhenFinished,
      launchpadType,
      { value }
    );

    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error(error, "createLaunchpad");
  }
};

export const approveTokenLocker = async (
  tokenAddress,
  walletType,
  walletProvider
) => {
  try {
    let instance = await getTokenContractInstance(
      tokenAddress,
      walletType,
      walletProvider
    );

    let tx = await instance.approve(
      BSC_CONTRACT_ADDRESS.TOKEN_LOCK,
      "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      { gasLimit: 100000 }
    );

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error, "approveLocker");
  }
};

export const approveTokenMultiSend = async (
  tokenAddress,
  approveAmount,
  walletType,
  walletProvider
) => {
  try {
    const instance = await getTokenContractInstance(
      tokenAddress,
      walletType,
      walletProvider
    );

    const tx = await instance.approve(
      BSC_CONTRACT_ADDRESS.TOKEN_MULTISEND,
      approveAmount,
      { gasLimit: 100000 }
    );

    const receipt = await tx.wait();
    return true;
  } catch (error) {
    console.log(error, "approveMultiSend");
    return false;
  }
};

export const createTokenLock = async (params, walletType, walletProvider) => {
  try {
    let signer = await getSigner(walletType, walletProvider);

    let lockerInstance = connectContract(
      TokenLockAbi,
      BSC_CONTRACT_ADDRESS.TOKEN_LOCK,
      signer
    );
    console.log("lockerInstance", ...params, globalWalletAddr);
    const value = ethers.utils.parseUnits("0.01", "ether");
    let tx = await lockerInstance.lock(globalWalletAddr, ...params, {
      value,
    });

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const getNormalTokensLock = async (tokenAddr) => {
  try {
    let lockerInstance = connectContract(
      TokenLockAbi,
      BSC_CONTRACT_ADDRESS.TOKEN_LOCK,
      globalProvider
    );
    let count = await lockerInstance.allNormalTokenLockedCount();

    let lockData = await lockerInstance.getCumulativeNormalTokenLockInfo(
      "0",
      count
    );

    if (tokenAddr) {
      lockData = lockData.filter((tken) => tken.token === tokenAddr);
    }

    const tokenDetails = await Promise.all(
      lockData.map((dt) => getTokenLockRecord(dt.token))
    );

    return tokenDetails.map((token, index) => ({
      decimal: lockData[index].decimals,
      name: lockData[index].name,
      symbol: lockData[index].symbol,
      totalLockedAmount: getTokenNumberFromBN(
        lockData[index].amount,
        lockData[index].decimals
      ),
      lockedData: token.map((tk) => ({
        id: getNumberFromBN(tk.id),
        lockedAmount: getTokenNumberFromBN(tk.amount, lockData[index].decimals),
        owner: tk.owner,
        unlockDate: getNumberFromBN(tk.unlockDate),
      })),
      lockDate: getNumberFromBN(token[0].lockDate),
      token: lockData[index].token,
    }));
  } catch (error) {
    console.log(error, "getNormalTokensLock");
  }
};

export const getTokenLockRecord = async (tokenAddress) => {
  try {
    let lockerInstance = connectContract(
      TokenLockAbi,
      BSC_CONTRACT_ADDRESS.TOKEN_LOCK,
      globalProvider
    );
    let count = await lockerInstance.totalLockCountForToken(tokenAddress);
    let data = await lockerInstance.getLocksForToken(tokenAddress, "0", count);
    return data;
  } catch (error) {
    console.log(error, "getTokenLockRecord");
  }
};

export const unlockToken = async (id, walletType, walletProvider) => {
  try {
    let signer = await getSigner(walletType, walletProvider);

    let lockerInstance = connectContract(
      TokenLockAbi,
      BSC_CONTRACT_ADDRESS.TOKEN_LOCK,
      signer
    );

    let tx = await lockerInstance.unlock(id);

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error, "unlock");
  }
};

export const multiSendToken = async (
  data,
  tokenAddress,
  walletType,
  walletProvider
) => {
  try {
    let signer = await getSigner(walletType, walletProvider);

    let multiSendInstance = connectContract(
      MultiSendTokenAbi,
      BSC_CONTRACT_ADDRESS.TOKEN_MULTISEND,
      signer
    );

    const tx = await multiSendInstance.bulkTransfer(data, tokenAddress);

    return tx;
  } catch (error) {
    console.log(error, "multisend");
  }
};

export const enableWhitelist = async (
  launchpadAddress,
  walletType,
  walletProvider
) => {
  try {
    let contractInstance = await launchpadContractInstance(
      launchpadAddress,
      walletType,
      walletProvider
    );

    let tx = await contractInstance.enableWhitelist();

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const disableWhitelist = async (
  launchpadAddress,
  time,
  walletType,
  walletProvider
) => {
  try {
    let contractInstance = await launchpadContractInstance(
      launchpadAddress,
      walletType,
      walletProvider
    );

    let tx = await contractInstance.disableWhitelist(time);

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const addUserInWhitelist = async (
  users,
  launchpadAddress,
  walletType,
  walletProvider
) => {
  try {
    let contractInstance = await launchpadContractInstance(
      launchpadAddress,
      walletType,
      walletProvider
    );

    let tx = await contractInstance.grantWhitelist(users);

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const removeUserInWhitelist = async (
  users,
  launchpadAddress,
  walletType,
  walletProvider
) => {
  try {
    let contractInstance = await launchpadContractInstance(
      launchpadAddress,
      walletType,
      walletProvider
    );

    let tx = await contractInstance.revokeWhitelist(users);

    let receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};
