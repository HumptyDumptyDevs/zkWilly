<script lang="ts">
	import '../../app.postcss';
	import '../../lib/web3modal';
	import Countdown from './Countdown.svelte';
	import mystery from '../../assets/mystery_fish.png';
	import { account } from '$lib/web3modal';

	let buttonDisabled = true;

	function handleTimerFinished() {
		buttonDisabled = false;
	}

	function mintNft() {
		console.log('Minting NFT');
	}
</script>

<main class="container mx-auto w-full flex-col justify-center items-center">
	<h2 class="h2 text-center text-black font-bold pb-2 md:pb-4 pt-10 md:pt-0">
		zkWilly X Sea Shepherd
	</h2>
	<h2 class="h2 text-center text-black font-bold pb-4 md:pb-8 pt-10 md:pt-0">Charity NFT</h2>
	<!-- <Countdown targetDate="2024-05-10T12:00:00" on:timerFinished={handleTimerFinished} /> -->
	<Countdown targetDate="2024-04-24T17:40:00" on:timerFinished={handleTimerFinished} />
	<div class="flex justify-center items-center overflow-y-auto pt-10">
		<div
			class="flex justify-center bg-surface-800 bg-opacity-70 w-3/4 gap-32 max-h-[500px] md:max-h-[600px] overflow-y-auto"
		>
			<!-- {#if $account.isConnected}
				<p>Hey</p>
			{:else}
				<p>Ho</p>
			{/if} -->
			<div class="text-sm">
				<a
					href="https://sadanduseless.b-cdn.net/wp-content/uploads/2019/10/puffer-trumps8.jpg"
					rel="noreferrer"
				>
					<img src={mystery} alt="zkWilly" class="w-96 pt-10" />
				</a>
				<p class="text-white text-center pt-4 md:pt-4">10% chance of a rare creature</p>
				<p class="text-white text-center pb-2 md:pb-2 pt-10 md:pt-0">
					1% chance of a legendary creature
				</p>
			</div>
			<div class="flex-col justify-center items-center py-6 text-sm w-2/5">
				<p class="text-white font-bold text-center pb-2 md:pb-4 pt-10 md:pt-0">Categories</p>
				<p class="text-white text-center pb-2 md:pb-4 pt-10 md:pt-0">
					NFTs correspond to the ETH balance of your wallet at the point of mint
				</p>

				<table class="relative table-auto w-full text-sm table-hover bg-surface-800 bg-opacity-70">
					<thead class="sticky top-0 text-sm text-left px-2 bg-surface-800">
						<tr>
							<th>ETH Balance</th>
							<th>Creature</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>&lt 0.01</td>
							<td>?</td>
						</tr>
						<tr>
							<td>&lt 0.2</td>
							<td>?</td>
						</tr>
						<tr>
							<td>&lt 0.5</td>
							<td>?</td>
						</tr>
						<tr>
							<td>&lt 1</td>
							<td>?</td>
						</tr>
						<tr>
							<td>&lt 3</td>
							<td>?</td>
						</tr>

						<tr>
							<td>&lt 5</td>
							<td>?</td>
						</tr>
						<tr>
							<td>&lt 10</td>
							<td>?</td>
						</tr>
						<tr>
							<td>&lt 20</td>
							<td>?</td>
						</tr>
						<tr>
							<td>&lt 100</td>
							<td>?</td>
						</tr>
						<tr>
							<td>100+</td>
							<td>?</td>
						</tr>
					</tbody>
				</table>
				<button
					class="btn btn-sm md:btn-md variant-filled-secondary mt-2 font-bold w-full rounded-none"
					on:click={mintNft}
					disabled={buttonDisabled}
				>
					Mint
				</button>
				<p class="text-white font-bold text-center pb-2 pt-2 md:pt-2">Price: $20</p>
				<p class="text-white text-center pb-2 md:pb-4">
					(100% of proceeds donated to Sea Shepherd)
				</p>
			</div>
		</div>
	</div>
</main>