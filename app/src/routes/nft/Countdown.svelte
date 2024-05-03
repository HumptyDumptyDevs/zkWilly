<script>
	import { createEventDispatcher } from 'svelte';

	export let targetDate;
	export let amountMinted = 0;

	// Calculate remaining time in milliseconds
	let remainingTime = new Date(targetDate).getTime() - Date.now();

	// Derived state: Convert milliseconds to days, hours, minutes, seconds
	$: days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
	$: hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	$: minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
	$: seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

	// Detect when the timer has finished and send the signal
	$: hasTimeElapsed = remainingTime <= 0;
	const dispatch = createEventDispatcher();
	$: if (hasTimeElapsed) {
		dispatch('timerFinished');
	}

	// Update the view every second
	setInterval(() => {
		remainingTime = new Date(targetDate).getTime() - Date.now();
	}, 1000);
</script>

<main>
	{#if remainingTime > 0}
		<div class="flex justify-center timer text-black font-bold">
			{days} : {hours} : {minutes} : {seconds}
		</div>
	{:else}
		<div class="flex justify-center timer text-black font-bold">
			{amountMinted} / 2500
		</div>
	{/if}
</main>

<style>
	.timer {
		font-size: 2em;
	}
</style>
