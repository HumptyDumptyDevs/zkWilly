<script>
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	export let targetDate;
	export let amountMinted;
	let totalTokens = 2500;

	// Calculate remaining time in milliseconds
	let remainingTime = new Date(targetDate).getTime() - Date.now();

	// Derived state: Convert milliseconds to days, hours, minutes, seconds
	$: days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
	$: hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	$: minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
	$: seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

	// Create a dispatcher to send signals
	const dispatch = createEventDispatcher();

	// Detect when the timer has finished and send the signal
	$: hasTimeElapsed = remainingTime <= 0;

	$: if (hasTimeElapsed) {
		dispatch('timerFinished');
	}

	// Detect when max tokens have been minted
	$: if (amountMinted >= totalTokens) {
		dispatch('maxTokensMinted');
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
			{#if amountMinted >= totalTokens}
				SOLD OUT
			{:else}
				{amountMinted} / {totalTokens}
			{/if}
		</div>
	{/if}
</main>

<style>
	.timer {
		font-size: 2em;
	}
</style>
