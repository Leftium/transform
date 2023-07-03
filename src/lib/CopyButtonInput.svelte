<svelte:options accessors={true} />

<script lang="ts">
	import 'iconify-icon'

	// Component props:
	export let label: string = ''
	export let value: string = ''
	export let copied: boolean = false

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

	<div class="wrapInput">
		<input type="text" {value} on:focus={handleFocusInput} />
		<div class="copied" hidden={!copied}>Copied!</div>
	</div>
</div>

<style>
	button {
		min-width: 10em;
	}

	.wrapInput {
		position: relative;
	}

	/* Place inside input right side, vertically centered */
	.copied {
		position: absolute;
		top: 50%;
		right: 0.5em;
		transform: translate(0, -50%);
		opacity: 50%;
	}
</style>
