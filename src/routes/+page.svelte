<script lang="ts">
	import '../app.scss'

	// Bindings:
	let query = ''

	const parseQuery = (q: string) => {
		let query = q.toLowerCase() // Normalize query.

		let value = parseFloat(query.replace(/[^0-9.]/g, ''))

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
</main>

<style>
	main {
		margin: 1em auto;
	}
</style>
