import pinataSDK from "@pinata/sdk";

export const pinataService = new pinataSDK({
  pinataJWTKey: process.env.REACT_APP_PINATA_JWT,
});

export const uploadInfoToIPFS = async (jsonObj) => {
  const { IpfsHash } = await pinataService.pinJSONToIPFS(jsonObj);
  return `${process.env.REACT_APP_PINATA_URL}${IpfsHash}`;
};
