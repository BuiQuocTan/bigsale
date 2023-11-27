export const RPC_URL_BSC = process.env.REACT_APP_BSC_RPC_URL;

export const BSC_CONTRACT_ADDRESS = {
  DEPLOYER: process.env.REACT_APP_BSC_CONTRACT_ADDR_DEPLOYER,
  TOKEN_LOCK: process.env.REACT_APP_BSC_CONTRACT_ADDR_TOKEN_LOCK,
  TOKEN_MANAGE: process.env.REACT_APP_BSC_CONTRACT_ADDR_TOKEN_MANAGE,
  TOKEN_MULTISEND: process.env.REACT_APP_BSC_CONTRACT_ADDR_MULTISEND,
};

export const CHAIN_SUPPORT = {
  bsc: "bsc",
};

export const CHAIN_INFO = {
  [CHAIN_SUPPORT.bsc]: {
    chainId: {
      mainnet: 56,
      testnet: 97,
    },
    baseNetworkUrl: {
      mainnet: "https://bscscan.com",
      testnet: "https://testnet.bscscan.com",
    },
    baseRpcNodeUrl: {
      mainnet: "https://bsc-dataseed.binance.org/",
      testnet: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    },
  },
};

enum COLOR_ENUM {
  GREEN = "green",
  PRIMARY = "primary",
  SECONDARY = "secondary",
  WARN = "warn",
}

export const LIST_SALE_STATUS = [
  {
    value: 0,
    label: "Upcoming",
    color: COLOR_ENUM.SECONDARY,
  },
  {
    value: 1,
    label: "Success",
    color: COLOR_ENUM.GREEN,
  },
  {
    value: 2,
    label: "Cancelled",
    color: COLOR_ENUM.WARN,
  },
  {
    value: 3,
    label: "Active",
    color: COLOR_ENUM.PRIMARY,
  },
  {
    value: 4,
    label: "Ended",
    color: COLOR_ENUM.SECONDARY,
  },
  {
    value: 5,
    label: "Failed",
    color: COLOR_ENUM.WARN,
  },
];

export const ListStatus = [
  {
    value: 0,
    label: "",
  },
  {
    value: 1,
    label: "Finished",
  },
  {
    value: 2,
    label: "Cancelled",
  },
];

export const STT_OK = 200;
export const STT_BAD_REQUEST = 400;
export const STT_UNAUTHORIZED = 401;
export const STT_FORBIDDEN = 403;
export const STT_NOT_FOUND = 404;
export const STT_INTERNAL_SERVER = 500;
export const STT_BAD_GATEWAY = 502;
