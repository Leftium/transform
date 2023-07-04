<script lang="ts">
	import '../app.scss'

	import * as cheerio from 'cheerio'
	import * as _ from 'lodash'

	import CopyButtonInput from '$lib/CopyButtonInput.svelte'
	import { tick } from 'svelte'

	// From load():
	export let data

	// Bindings:
	let inputQuery: HTMLInputElement
	let query = ''
	let btcToSatInput: CopyButtonInput
	let usdToSatInput: CopyButtonInput
	let krwToSatInput: CopyButtonInput
	let copiedInput: CopyButtonInput | null = null

	const cc = cheerio.load(data.sample)

	cc('path').remove()
	cc('p[data-testid="credit-card-tracker-progress-message"]').remove()

	const ccAccounts = cc('li:has([data-mjs="accounts-account"])')

	const accounts = _.map(ccAccounts, (account: any) => {
		const ccAccount = cc(account)
		let bank = ccAccount.find('title').text().replace('Institution icon ', '')
		let title = ccAccount.find('h3:first').text().trim()
		let balance = ccAccount.find('h3:last').text().trim()
		let type = ccAccount.find('p:first').text().trim()
		let updated = ccAccount.find('p:last').text().trim()

		return {
			bank,
			title,
			balance,
			type,
			updated,
		}
	})

	const parseQuery = (q: string) => {
		const query = q.toLowerCase() // Normalize query.

		let value = parseFloat(query.replace(/[^0-9.]/g, ''))
		if (isNaN(value)) {
			value = 1
		}

		let unit = 'none'
		if (query.includes('$') || query.includes('usd')) {
			unit = 'usd'
		} else if (query.includes('btc')) {
			unit = 'btc'
		} else if (query.includes('krw')) {
			unit = 'krw'
		}

		return {
			value,
			unit,
		}
	}

	function nullHandler() {}

	function handleFocus(this: HTMLInputElement) {
		this.select()
	}

	function handleInput() {
		copiedInput = null
	}

	async function handlePaste(event: ClipboardEvent) {
		const data = event.clipboardData?.getData('text')

		if (data) {
			inputQuery.value = data
			parsedQuery = parseQuery(data)

			await tick()
			let text = ''
			switch (parsedQuery.unit) {
				case 'btc':
					text = btcToSatInput.value || ''
					copiedInput = btcToSatInput
					break
				case 'usd':
					text = usdToSatInput.value || ''
					copiedInput = usdToSatInput
					break
				case 'krw':
					text = krwToSatInput.value || ''
					copiedInput = krwToSatInput
					break
			}
			if (text) {
				navigator.clipboard.writeText(text)
			}
		}
	}

	$: parsedQuery = parseQuery(query)
</script>

<svelte:body on:paste={handlePaste} />

<main class="container">
	<pre>{JSON.stringify(accounts, null, 4)}</pre>
	<div>
		<input
			type="text"
			bind:this={inputQuery}
			bind:value={query}
			on:paste|preventDefault={nullHandler}
			on:focus={handleFocus}
			on:input={handleInput}
		/>
	</div>

	<div><b>value:</b> {parsedQuery.value}</div>
	<div><b>unit:</b> {parsedQuery.unit}</div>

	<hr />

	<div>
		<CopyButtonInput
			bind:this={btcToSatInput}
			label="BTC&#8680;SAT"
			value={(parsedQuery.value * 100_000_000).toLocaleString()}
			copied={copiedInput === btcToSatInput}
		/>
	</div>
	<div>
		<CopyButtonInput
			bind:this={usdToSatInput}
			label="USD&#8680;SAT"
			value={(parsedQuery.value * data.satsPerUsd).toLocaleString()}
			copied={copiedInput === usdToSatInput}
		/>
	</div>
	<div>
		<CopyButtonInput
			bind:this={krwToSatInput}
			label="KRW&#8680;SAT"
			value={(parsedQuery.value * data.satsPerKrw).toLocaleString()}
			copied={copiedInput === krwToSatInput}
		/>
	</div>
</main>

<style>
	main {
		margin: 1em auto;
	}
</style>
