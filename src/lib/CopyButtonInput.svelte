<script lang="ts">
	import 'iconify-icon'

	// Component props:
	export let label: string = ''
	export let value: string = ''
</script>

<div role="group">
	<button><iconify-icon icon="clarity:copy-to-clipboard-line" inline /> {label}</button>
	<input type="text" {value} />
</div>

<style>
	button {
		min-width: 10em;
	}
</style>
