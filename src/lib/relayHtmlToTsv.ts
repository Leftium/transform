import _ from 'lodash'
import * as cheerio from 'cheerio'

const COLUMN_MAP: Record<string, { institutionIcon: string; column: string; balance: string }> = {
	'360 Checking ***0247': {
		column: 'Q',
		institutionIcon: 'Capital One',
		balance: '$1,000.00',
	},
	'Investor Checking ***7195': {
		column: 'R',
		institutionIcon: 'Charles Schwab',
		balance: '$3,003.34',
	},
	'Checking ***1117': {
		column: 'S',
		institutionIcon: 'Citibank',
		balance: '$2,692.90',
	},
	'Citi® Accelerate Savings ***6821': {
		column: 'T',
		institutionIcon: 'Citibank',
		balance: '$34,186.92',
	},
	PayPal: {
		column: 'U',
		institutionIcon: '',
		balance: '$0.00',
	},
	'Checking - 1820': {
		column: 'V',
		institutionIcon: '',
		balance: '$101.04',
	},
	'Savings - 0426': {
		column: 'W',
		institutionIcon: '',
		balance: '$13,056.39',
	},
	'Wise USD account': {
		column: 'P',
		institutionIcon: '',
		balance: '$12,361.27',
	},
	'Blue Cash Everyday® ***1004': {
		column: 'AD',
		institutionIcon: 'American Express',
		balance: '$0.00',
	},
	'BoA NEA MC': {
		column: 'AE',
		institutionIcon: '',
		balance: '$0.00',
	},
	'Barclays View Mastercard ***2732': {
		column: 'AF',
		institutionIcon: '',
		balance: '-$9.37',
	},
	'Quicksilver ***1658': {
		column: 'AG',
		institutionIcon: 'Capital One',
		balance: '$1.50',
	},
	'REI Co-op Mastercard ***9770': {
		column: 'AH',
		institutionIcon: 'Capital One',
		balance: '$0.00',
	},
	'Amazon Prime Rewards Visa Signature Card ***3898': {
		column: 'AI',
		institutionIcon: 'Chase',
		balance: '$0.00',
	},
	'PayPal Mastercard ***4132': {
		column: 'AJ',
		institutionIcon: '',
		balance: '$0.00',
	},
	'SoFi Credit Card ***6550': {
		column: 'AK',
		institutionIcon: '',
		balance: '-$31.46',
	},
	'WELLS FARGO AUTOGRAPH VISA® CARD ...7484 ***7484': {
		column: 'AL',
		institutionIcon: 'Wells Fargo',
		balance: '-$965.00',
	},
	'Individual ***1766': {
		column: '',
		institutionIcon: 'Charles Schwab',
		balance: '$300.06',
	},
	'Roth Contributory IRA ***4487': {
		column: 'Y',
		institutionIcon: 'Charles Schwab',
		balance: '$69,359.96',
	},
	'SoFi Active Investing ***8688': {
		column: 'AA',
		institutionIcon: '',
		balance: '$150.42',
	},
	'SoFi Crypto ***9380': {
		column: 'AB',
		institutionIcon: '',
		balance: '$106.80',
	},
	'Treasury Direct': {
		column: 'X',
		institutionIcon: '',
		balance: '$10,820.00',
	},
	'ROTH_IRA ***1985': {
		column: 'Z',
		institutionIcon: 'Vanguard',
		balance: '$48,692.95',
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
	const data: Record<string, { institutionIcon: string; balance: string; column: string }> = {}

	const accounts = _.map(ccAccounts, (account) => {
		const ccAccount = cc(account)
		const institutionIcon = ccAccount
			.find('title')
			?.text()
			.replace(/Institution icon (undefined)?/, '')
		const title = ccAccount.find('h3:first').text().trim()
		const balance = ccAccount.find('h3:last').text().trim()
		const type = ccAccount.find('p:first').text().trim()
		const updated = ccAccount
			.find('p:last')
			.text()
			.replaceAll(/\n|(about )|(less than )|( ago)/gi, '')
			.replace(/\s+/g, ' ')
			.trim()

		const column = COLUMN_MAP[title]?.column || ''
		const index = columnToNumber(column)

		data[title] = {
			column,
			balance,
			institutionIcon,
		}

		const item = {
			title,
			balance,
			updated,
			type,
			institutionIcon,
		}

		output[index] = item

		return item
	})

	console.table(data)
	console.table(output)

	if (accounts.length) {
		output[1] = {
			balance: new Date().toLocaleDateString(),
		}

		const outputText = [
			output.map((item) => item.balance).join('\t'),
			output.map((item) => item.updated || '').join('\t'),
			output
				.map((item) => (item?.title ? `${item?.title} | ${item?.institutionIcon}` : ''))
				.join('\t'),
		].join('\n')

		return outputText
	} else {
		return null
	}
}
