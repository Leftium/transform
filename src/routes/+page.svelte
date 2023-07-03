<script lang="ts">
	import '../app.scss'

	import CopyButtonInput from '$lib/CopyButtonInput.svelte'

	// From load():
	export let data

	// Bindings:
	let query = ''

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

	$: parsedQuery = parseQuery(query)
</script>

<main class="container">
	<div><input type="text" bind:value={query} /></div>

	<div><b>value:</b> {parsedQuery.value}</div>
	<div><b>unit:</b> {parsedQuery.unit}</div>

	<hr />

	<div>
		<CopyButtonInput
			label="BTC&#8680;SAT"
			value={(parsedQuery.value * 100_000_000).toLocaleString()}
		/>
	</div>
	<div>
		<CopyButtonInput
			label="USD&#8680;SAT"
			value={(parsedQuery.value * data.satsPerUsd).toLocaleString()}
		/>
	</div>
	<div>
		<CopyButtonInput
			label="KRW&#8680;SAT"
			value={(parsedQuery.value * data.satsPerKrw).toLocaleString()}
		/>
	</div>
</main>

<style>
	main {
		margin: 1em auto;
	}
</style>
