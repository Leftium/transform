import _ from 'lodash'
import * as cheerio from 'cheerio'

const COLUMN_MAP: Record<string, { bank: string; column: string }> = {
	'Investor Checking ***7195': {
		bank: 'Charles Schwab',
		column: 'O',
	},
	'Checking ***1117': {
		bank: 'Citibank',
		column: 'P',
	},
	'Citi® Accelerate Savings ***6821': {
		bank: 'Citibank',
		column: 'Q',
	},
	PayPal: {
		bank: 'Bank',
		column: 'R',
	},
	'Blue Cash Everyday® ***1004': {
		bank: 'American Express',
		column: 'AE',
	},
	'BoA NEA MC': {
		bank: 'Bank',
		column: 'AD',
	},
	'Barclays View Mastercard ***2732': {
		bank: 'Bank',
		column: 'AF',
	},
	'Quicksilver ***1658': {
		bank: 'Capital One',
		column: 'AA',
	},
	'REI Co-op Mastercard ***9770': {
		bank: 'Capital One',
		column: 'AB',
	},
	'Amazon Prime Rewards Visa Signature Card ***3898': {
		bank: 'Chase',
		column: 'AC',
	},
	'PayPal Mastercard ***4132': {
		bank: 'Bank',
		column: 'AG',
	},
	'SoFi Credit Card ***6550': {
		bank: 'SoFi',
		column: 'Z',
	},
	'WELLS FARGO AUTOGRAPH VISA® CARD ...7484 ***7484': {
		bank: 'Wells Fargo',
		column: 'Y',
	},
	Daniel: {
		bank: 'Bank',
		column: 'AK',
	},
	'Individual ***1766': {
		bank: 'Charles Schwab',
		column: '',
	},
	'Roth Contributory IRA ***4487': {
		bank: 'Charles Schwab',
		column: 'T',
	},
	'SoFi Active Investing ***8688': {
		bank: 'SoFi',
		column: 'V',
	},
	'SoFi Crypto ***9380': {
		bank: 'SoFi',
		column: 'W',
	},
	'Treasury Direct': {
		bank: 'Invest',
		column: 'S',
	},
	'ROTH_IRA ***1985': {
		bank: 'Vanguard',
		column: 'U',
	},
}

// Excel Column to Index:
function columnToNumber(s: string) {
	// This process is similar to
	// binary-to-decimal conversion
	let result = 0
	for (let i = 0; i < s.length; i++) {
		result *= 26
		result += s[i].charCodeAt(0) - 'A'.charCodeAt(0) + 1
	}
	return result - 1
}

export const relayHtmlToTsv = (html: string) => {
	const cc = cheerio.load(html)

	cc('path').remove()
	cc('p[data-testid="credit-card-tracker-progress-message"]').remove()

	const ccAccounts = cc('li:has([data-mjs="accounts-account"])')

	const output: Record<string, string>[] = []

	const accounts = _.map(ccAccounts, (account) => {
		const ccAccount = cc(account)
		const bank = ccAccount.find('title').text().replace('Institution icon ', '')
		const title = ccAccount.find('h3:first').text().trim()
		const balance = ccAccount.find('h3:last').text().trim()
		const type = ccAccount.find('p:first').text().trim()
		const updated = ccAccount
			.find('p:last')
			.text()
			.replaceAll(/\n|(about )|(less than )|( ago)/gi, '')
			.replace(/\s+/g, ' ')
			.trim()

		const column = COLUMN_MAP[title].column
		const index = columnToNumber(column)

		const item = {
			bank,
			title,
			balance,
			type,
			updated,
		}

		output[index] = item

		return item
	})

	if (accounts.length) {
		output[1] = {
			balance: new Date().toISOString().substring(0, 10),
		}

		const outputText = [
			output.map((item) => item.balance).join('\t'),
			output.map((item) => item.updated || '').join('\t'),
			output.map((item) => (item?.title ? `${item?.title} | ${item?.bank}` : '')).join('\t'),
		].join('\n')

		return outputText
	} else {
		return null
	}
}