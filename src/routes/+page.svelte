<script lang="ts">
	import '../app.scss'

	import CopyButtonInput from '$lib/CopyButtonInput.svelte'
	import { tick } from 'svelte'
	import { relayHtmlToTsv } from '$lib/relayHtmlToTsv'

	// From load():
	export let data

	// Bindings:
	let inputQuery: HTMLInputElement
	let query = ''

	let usdToKrwInput: CopyButtonInput
	let krwToUsdInput: CopyButtonInput
	let btcToSatInput: CopyButtonInput
	let usdToSatInput: CopyButtonInput
	let krwToSatInput: CopyButtonInput
	let copiedInput: CopyButtonInput | null = null

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
		} else if (query.includes('원') || query.includes('₩') || query.includes('krw')) {
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
		copiedInput = null
		const clipboardText = event.clipboardData?.getData('text')

		if (clipboardText) {
			let text = relayHtmlToTsv(clipboardText)
			if (text) {
				inputQuery.value = 'TSV copied to clipboard!'
				parsedQuery = parseQuery(inputQuery.value)
			} else {
				inputQuery.value = clipboardText
				parsedQuery = parseQuery(clipboardText)

				await tick()
				switch (parsedQuery.unit) {
					case 'btc':
						text = btcToSatInput.value || ''
						copiedInput = btcToSatInput
						break
					case 'usd':
						text = usdToKrwInput.value || ''
						copiedInput = usdToKrwInput
						break
					case 'krw':
						text = krwToUsdInput.value || ''
						copiedInput = krwToUsdInput
						break
				}
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
			bind:this={usdToKrwInput}
			label="USD&#8680;KRW"
			value={(parsedQuery.value * data.krwPerUsd).toLocaleString()}
			copied={copiedInput === usdToKrwInput}
		/>
	</div>

	<div>
		<CopyButtonInput
			bind:this={krwToUsdInput}
			label="KRW&#8680;USD"
			value={(parsedQuery.value * data.usdPerKrw).toLocaleString()}
			copied={copiedInput === krwToUsdInput}
		/>
	</div>

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
