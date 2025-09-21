import _ from 'lodash'
import * as cheerio from 'cheerio'
import * as chrono from 'chrono-node'

const COLUMN_ARRAY = [
	{
		title: '360 Checking ***0247',
		column: 'N',
		balance: '$0.00',
		institutionIcon: 'Capital One',
	},
	{
		title: '360 Performance Savings ***1671',
		column: '',
		balance: '$22.65',
		institutionIcon: 'Capital One',
	},
	{
		title: 'Investor Checking ***7195',
		column: '',
		balance: '$62.01',
		institutionIcon: 'Charles Schwab',
	},
	{
		title: 'Citi® Accelerate Savings ***6821',
		column: '',
		balance: '$30,000.36',
		institutionIcon: 'Citibank',
	},
	{
		title: 'Checking - 1820',
		column: '',
		balance: '$0.69',
		institutionIcon: '',
	},
	{
		title: 'Savings - 0426',
		column: '',
		balance: '$6.82',
		institutionIcon: '',
	},
	{
		title: 'USD account ***3304',
		column: '',
		balance: '$4,230.05',
		institutionIcon: '',
	},
	{
		title: 'Blue Cash Everyday® ***1004',
		column: 'AC',
		balance: '$0.00',
		institutionIcon: 'American Express',
	},
	{
		title: 'BoA NEA MC',
		column: '',
		balance: '$0.00',
		institutionIcon: '',
	},
	{
		title: 'Barclays View Mastercard ***2732',
		column: '',
		balance: '-$13.19',
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
		title: 'Savor ***0736',
		column: '',
		balance: '$0.00',
		institutionIcon: 'Capital One',
	},
	{
		title: 'Prime Visa ***3898',
		column: '',
		balance: '-$73.94',
		institutionIcon: 'Chase',
	},
	{
		title: 'SoFi Credit Card ***6550',
		column: '',
		balance: '-$380.38',
		institutionIcon: '',
	},
	{
		title: 'WELLS FARGO AUTOGRAPH VISA® CARD ...7484',
		column: '',
		balance: '-$106.54',
		institutionIcon: 'Wells Fargo',
	},
	{
		title: 'Individual ***1766',
		column: '-1',
		balance: '$0.00',
		institutionIcon: 'Charles Schwab',
	},
	{
		title: 'Roth Contributory IRA ***4487',
		column: 'AQ',
		balance: '$97,584.86',
		institutionIcon: 'Charles Schwab',
	},
	{
		title: 'SoFi Active Investing ***8688',
		column: '',
		balance: '$487.65',
		institutionIcon: '',
	},
	{
		title: 'ROTH_IRA ***1985',
		column: '',
		balance: '$77,726.05',
		institutionIcon: 'Vanguard',
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
		const hoursAgo = `${((Number(now) - Number(start)) / 60 / 60 / 1000).toFixed(0)}h`

		const item = {
			title,
			balance,
			updated,
			hoursAgo,
			type,
			institutionIcon,
		}

		if (index >= 0) {
			output[index] = item
		}

		return item
	})

	/*
	data.sort((a, b) => {
		const aColumnIndex = columnToNumber(a.column)
		const bColumnIndex = columnToNumber(b.column)

		return aColumnIndex - bColumnIndex
	})
    */

	_.forEachRight(data, (item, i, collection) => {
		if (i > 0 && columnToNumber(item.column) - 1 === columnToNumber(collection[i - 1].column)) {
			item.column = ''
		}
	})

	const outputDense = Array.from({ length: output.length + 2 }, (_, i) => {
		return output[i] ?? null
	})

	console.table(data)
	console.table(output)
	///console.table(outputDense)

	if (accounts.length) {
		outputDense[1] = {
			balance: new Date().toLocaleDateString(),
		}

		const outputText = [
			outputDense.map((item) => (!item ? '' : item.balance)).join('\t'),
			'',
			outputDense.map((item) => (!item ? '.' : item.hoursAgo)).join('\t'),
			outputDense
				.map((item) => (!item?.title ? '.' : `${item?.title} | ${item?.institutionIcon}`))
				.join('\t'),
		].join('\n')

		return outputText
	} else {
		return null
	}
}
