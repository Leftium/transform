
export const load = async ({ fetch }) => {
	const response = await fetch(
		'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,krw'
	)
	const json = await response.json()


	return {
		satsPerUsd: 100_000_000 / json.bitcoin.usd,
		satsPerKrw: 100_000_000 / json.bitcoin.krw,
	}
}
