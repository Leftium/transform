<script lang="ts">
	// Component props:
	export let label: string = ''
	export let value: string = ''
</script>

<div role="group">
	<button>{label}</button>
	<input type="text" {value} />
</div>

<style>
	button {
		min-width: 9em;
	}
</style>
