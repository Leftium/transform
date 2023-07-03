<svelte:options accessors={true} />

<script lang="ts">
	import IconCopyToClipboard from '~icons/clarity/copy-to-clipboard-line'

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
		<IconCopyToClipboard style="vertical-align: -0.225em" />
		{label}
	</button>
	<div class="copied" hidden={!copied}>Copied!</div>
	<input type="text" {value} on:focus={handleFocusInput} />
</div>

<style>
	button {
		min-width: 11em;
	}

	div[role='group'] {
		position: relative;
	}

	/* Place inside input right side, vertically centered */
	.copied {
		z-index: 1000;
		position: absolute;
		top: 50%;
		right: 0.5em;
		transform: translate(0, -50%);
		opacity: 50%;
	}
</style>
