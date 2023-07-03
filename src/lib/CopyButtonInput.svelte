<script lang="ts">
	import 'iconify-icon'

	// Component props:
	export let label: string = ''
	export let value: string = ''

	function handleClickButton() {
		navigator.clipboard.writeText(value)
	}

	function handleFocusInput(this: HTMLInputElement) {
		this.select()
	}
</script>

<div role="group">
	<button on:click={handleClickButton}>
		<iconify-icon icon="clarity:copy-to-clipboard-line" inline />
		{label}
	</button>

	<input type="text" {value} on:focus={handleFocusInput} on:click={handleFocusInput} readonly />
</div>

<style>
	button {
		min-width: 10em;
	}
</style>
