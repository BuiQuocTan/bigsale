import moment from "moment"
import { BigNumber, utils } from "ethers"
import { ListsType } from "../pages/Dashboard/LaunchPad/Lists/demo-data"

export const shortenAddress = (address: string): string => {
	let start = address.substring(0, 6)
	let end = address.substring(address.length - 1 - 3, address.length)
	const result = `${start}....${end}`
	return result
}
export const formatTimeStamp = (date: string) => parseInt(moment(date).format("x"), 10)

export const formatNumberToCurrencyString = (number: number) => new Intl.NumberFormat().format(number)

export const getNumberFromBN = (number: BigNumber): number =>
	BigNumber.isBigNumber(number) ? number.toNumber() : number

export const getTokenNumberFromBN = (number: BigNumber, decimals: number): string =>
	utils.formatUnits(number, decimals || 18)

export const getUTCTimestamp = (dateStr: string): number => Math.round(new Date(dateStr).getTime() / 1000)

export const getBNFromToken = (number: string, decimals: number): BigNumber => utils.parseUnits(number, decimals || 18)

export const getSaleStatus = (curPool: ListsType) => {
	const curDate = Date.now()
	switch (curPool.status) {
		default:
			return 0
		case 1:
		case 2:
			return curPool.status
		case 0:
			if (curPool?.startDate <= curDate && curPool?.endDate >= curDate) return 3
			if (curPool?.endDate < curDate) return Number(curPool?.softCap) > Number(curPool?.totalDeposits) ? 5 : 4
			return 0
	}
}

export const getValidYoutubeLink = (youtubeStr: string): string => youtubeStr.replace("watch?v=", "embed/")


export const makeString = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}