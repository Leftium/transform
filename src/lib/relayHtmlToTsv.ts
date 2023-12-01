import _ from 'lodash'
import * as cheerio from 'cheerio'
import * as chrono from 'chrono-node'

const COLUMN_ARRAY = [
	{
		title: 'Individual ***1766',
		column: '',
		balance: '$0.07',
		institutionIcon: 'Charles Schwab',
	},
	{
		title: 'USD account ***3304',
		column: 'P',
		balance: '$14,034.97',
		institutionIcon: '',
	},
	{
		title: '360 Checking ***0247',
		column: '',
		balance: '$1,000.31',
		institutionIcon: 'Capital One',
	},
	{
		title: '360 Performance Savings ***1671',
		column: '',
		balance: '$50,100.00',
		institutionIcon: 'Capital One',
	},
	{
		title: 'Investor Checking ***7195',
		column: '',
		balance: '$500.45',
		institutionIcon: 'Charles Schwab',
	},
	{
		title: 'Checking ***1117',
		column: '',
		balance: '$1,000.00',
		institutionIcon: 'Citibank',
	},
	{
		title: 'Citi® Accelerate Savings ***6821',
		column: '',
		balance: '$11,132.59',
		institutionIcon: 'Citibank',
	},
	{
		title: 'PayPal',
		column: '',
		balance: '$30.65',
		institutionIcon: '',
	},
	{
		title: 'Checking - 1820',
		column: '',
		balance: '$101.12',
		institutionIcon: '',
	},
	{
		title: 'Savings - 0426',
		column: '',
		balance: '$1,092.21',
		institutionIcon: '',
	},
	{
		title: "John's Account ***195",
		column: '',
		balance: '$10,880.00',
		institutionIcon: '',
	},
	{
		title: 'Roth Contributory IRA ***4487',
		column: '',
		balance: '$71,122.16',
		institutionIcon: 'Charles Schwab',
	},
	{
		title: 'ROTH_IRA ***1985',
		column: '',
		balance: '$52,020.20',
		institutionIcon: 'Vanguard',
	},
	{
		title: 'SoFi Active Investing ***8688',
		column: '',
		balance: '$303.72',
		institutionIcon: '',
	},
	{
		title: 'Blue Cash Everyday® ***1004',
		column: 'AE',
		balance: '-$29.31',
		institutionIcon: 'American Express',
	},
	{
		title: 'BoA NEA MC',
		column: '',
		balance: '-$188.49',
		institutionIcon: '',
	},
	{
		title: 'Barclays View Mastercard ***2732',
		column: '',
		balance: '$0.00',
		institutionIcon: '',
	},
	{
		title: 'Quicksilver ***1658',
		column: '',
		balance: '$0.00',
		institutionIcon: 'Capital One',
	},
	{
		title: 'REI Co-op Mastercard ***9770',
		column: '',
		balance: '$0.00',
		institutionIcon: 'Capital One',
	},
	{
		title: 'Amazon Prime Rewards Visa Signature Card ***3898',
		column: '',
		balance: '$0.00',
		institutionIcon: 'Chase',
	},
	{
		title: 'PayPal Mastercard ***4132',
		column: '',
		balance: '-$0.51',
		institutionIcon: '',
	},
	{
		title: 'SoFi Credit Card ***6550',
		column: '',
		balance: '-$67.12',
		institutionIcon: '',
	},
	{
		title: 'WELLS FARGO AUTOGRAPH VISA® CARD ...7484 ***7484',
		column: '',
		balance: '-$1,070.98',
		institutionIcon: 'Wells Fargo',
	},
]

const COLUMNS = _.map(COLUMN_ARRAY, (item, i, collection) => {
	if (i > 0) {
		const prevItem = collection[i - 1]
		if (!item.column && prevItem.column) {
			item.column = numberToColumn(columnToNumber(prevItem.column) + 1)
		}
	}
	return item
})

const now = new Date()

function numberToColumn(num: number) {
	let letters = ''
	while (num >= 0) {
		letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters
		num = Math.floor(num / 26) - 1
	}
	return letters
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
	const data: Array<{ title: string; institutionIcon: string; balance: string; column: string }> =
		[]

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
			.replaceAll(/\n|(about )|(less than )/gi, '')
			.replace(/\s+/g, ' ')
			.trim()

		const column = _.find(COLUMNS, { title })?.column || ''
		const index = columnToNumber(column)

		data.push({
			title,
			column,
			balance,
			institutionIcon,
		})

		const result = chrono.parse(updated)
		const start = result[0].start.date()
		const hoursAgo = `${((Number(now) - Number(start)) / 60 / 60 / 1000).toFixed(2)}h`

		const item = {
			title,
			balance,
			updated,
			hoursAgo,
			type,
			institutionIcon,
		}

		output[index] = item

		return item
	})

	data.sort((a, b) => {
		const aColumnIndex = columnToNumber(a.column)
		const bColumnIndex = columnToNumber(b.column)

		return aColumnIndex - bColumnIndex
	})

	_.forEachRight(data, (item, i, collection) => {
		if (i > 0 && columnToNumber(item.column) - 1 === columnToNumber(collection[i - 1].column)) {
			item.column = ''
		}
	})

	console.table(data)
	console.table(output)

	if (accounts.length) {
		output[1] = {
			balance: new Date().toLocaleDateString(),
		}

		const outputText = [
			output.map((item) => item.balance).join('\t'),
			output.map((item) => item.hoursAgo || '').join('\t'),
			output
				.map((item) => (item?.title ? `${item?.title} | ${item?.institutionIcon}` : ''))
				.join('\t'),
		].join('\n')

		return outputText
	} else {
		return null
	}
}
