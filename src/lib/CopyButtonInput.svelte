<script lang="ts">
	import 'iconify-icon'

	// Component props:
	export let label: string = ''
	export let value: string = ''

	const handleClickButton = () => {
		navigator.clipboard.writeText(value)
	}

	const handleFocusInput = (event: FocusEvent) => {
		;(<HTMLInputElement>event.target).select()
	}
</script>

<div role="group">
	<button on:click={handleClickButton}>
		<iconify-icon icon="clarity:copy-to-clipboard-line" inline />
		{label}
	</button>

	<input type="text" {value} on:focus={handleFocusInput} />
</div>

<style>
	button {
		min-width: 10em;
	}
</style>
