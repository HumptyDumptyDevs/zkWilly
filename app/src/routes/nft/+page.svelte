<script lang="ts">
	import '../../app.postcss';
	import '$lib/web3modal';
	import { abi } from '$lib/zkWillyNftAbi';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { type ModalSettings } from '@skeletonlabs/skeleton';
	import Countdown from './Countdown.svelte';
	import mystery from '../../assets/mystery_fish.png';
	import planktonStandard from '../../assets/nft/plankton-standard.png';
	import planktonShiny from '../../assets/nft/plankton-shiny.png';
	import shrimpStandard from '../../assets/nft/shrimp-standard.png';
	import shrimpShiny from '../../assets/nft/shrimp-shiny.png';
	import pufferfishStandard from '../../assets/nft/pufferfish-standard.png';
	import pufferfishShiny from '../../assets/nft/pufferfish-shiny.png';
	import dolphinStandard from '../../assets/nft/dolphin-standard.png';
	import dolphinShiny from '../../assets/nft/dolphin-shiny.png';
	import belugaStandard from '../../assets/nft/beluga-standard.png';
	import belugaShiny from '../../assets/nft/beluga-shiny.png';
	import narwhalStandard from '../../assets/nft/narwhal-standard.png';
	import narwhalShiny from '../../assets/nft/narwhal-shiny.png';
	import orcaStandard from '../../assets/nft/orca-standard.png';
	import orcaShiny from '../../assets/nft/orca-shiny.png';
	import humpbackStandard from '../../assets/nft/humpback-standard.png';
	import humpbackShiny from '../../assets/nft/humpback-shiny.png';
	import spermStandard from '../../assets/nft/sperm-standard.png';
	import spermShiny from '../../assets/nft/sperm-shiny.png';
	import blueWhaleStandard from '../../assets/nft/blue-whale-standard.png';
	import blueWhaleShiny from '../../assets/nft/blue-whale-shiny.png';
	import goldenWilly from '../../assets/nft/golden-willy.png';
	import { watchContractEvent, getAccount } from '@wagmi/core';
	import { account, mintNft, getTokenUri, getAmountMinted, wagmiConfig } from '$lib/web3modal';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { PUBLIC_NFT_CONTRACT_ADDRESS } from '$env/static/public';

	// Stores
	const modalStore = getModalStore();
	let amountMinted = writable(0);

	const modal: ModalSettings = {
		type: 'alert',
		// Data
		title: 'Mint Successful!', // Default title
		body: 'You have successfully minted your NFT.', // Default body
		image: 'https://i.imgur.com/WOgTG96.gif'
	};

	let targetDate = '2024-04-30T11:12:00';
	let timerFinished = false;
	let maxTokensMinted = false;
	let isMinting = false;
	let errorMessage = null;

	function handleTimerFinished() {
		timerFinished = true;
	}

	function handleMaxTokensMinted() {
		maxTokensMinted = true;
		// console.log('Max tokens minted', maxTokensMinted);
		// console.log('account connected', $account.isConnected);
		// console.log('timer finished', timerFinished);
	}

	onMount(async () => {
		// Using onMount to trigger the async actions
		await initializeOnMount();
	});

	async function initializeOnMount() {
		const currentTime = new Date().getTime();
		const targetTime = new Date(targetDate).getTime();

		if (currentTime >= targetTime) {
			handleTimerFinished();
			// Using $amountMinted.set here to update the store's value
			$amountMinted = await getAmountMinted();
			console.log('Amount minted:', $amountMinted);
		}

		watchContractEvent(wagmiConfig, {
			address: PUBLIC_NFT_CONTRACT_ADDRESS,
			abi,
			eventName: 'NFTMinted',
			async onLogs(logs) {
				console.log('Mint event caught!', logs);

				$amountMinted = await getAmountMinted();
			}
		});
	}

	async function mint() {
		// Update mint function
		console.log('Minting NFT');
		isMinting = true;
		errorMessage = null;

		const unwatchSelfMint = watchContractEvent(wagmiConfig, {
			address: PUBLIC_NFT_CONTRACT_ADDRESS,
			abi,
			eventName: 'NFTMinted',
			args: { minter: getAccount(wagmiConfig).address },
			async onLogs(logs) {
				console.log('Self Mint event caught!', logs);

				// Get tokenId from event
				const tokenId = logs[0].args.tokenId;
				const tokenUri = await getTokenUri(tokenId);

				const ipfsToLocalImageMap = {
					'ipfs://QmY4TJEBNdARPwfXBvL2HhKsQf36PjUGokz2wksd5oF5ah/': planktonStandard,
					'ipfs://QmWDScpviJzPzD8WhEday1GjVTMMiQF3UNtP5aDqPh6oxT/': planktonShiny,
					'ipfs://Qma5DPMj4XeihW6mvuGuqUbjkbLeSJUWsHqGkBX98Qnkeg/': shrimpStandard,
					'ipfs://QmcW2z6UfXQcV1n9zt9fQCiUPNqop8tvCGmuTtMMR84ZkF/': shrimpShiny,
					'ipfs://QmaBDxQgh9vRRqswacic6tAZgfjnu5Ci9uY2krzBZf4GVB/': pufferfishStandard,
					'ipfs://QmedpgVF91HHdWXN1yn9v5PMVPdoee6627ANaBVbmWRQTX/': pufferfishShiny,
					'ipfs://QmV1mtATyJ8s6Z6Z2uukVtDxa1vo9rduEz6aXY5D1UYgWh/': dolphinStandard,
					'ipfs://QmSPaNzEYQKd6t7a3idMsLf2tba7sdPJraRfPk2LZtKoRh/': dolphinShiny,
					'ipfs://Qmd1A3nS9BaSRhrFmSA7hoS86qaAZ1MTfEKVAMdQ9uwYwv/': belugaStandard,
					'ipfs://QmXVbcKt2VCPkZmV2aKwBdPx6PBch9Uv7dRPmW8SC8qGjD/': belugaShiny,
					'ipfs://QmXaMHiJUXBg4Kq1eozmashFdLS1kHkiFKgAdXz13dqSMC/': narwhalStandard,
					'ipfs://QmRyxrqQgLSAVXs4b2T3k5ubBgjT5NE8UF2sExWFimdxWA/': narwhalShiny,
					'ipfs://Qmf5mH5fSwe8Q72g2eagJaHBUHQxgsyyMFZqkDGCs3dcaZ/': orcaStandard,
					'ipfs://QmViHFvfytZR95txpUf38G9YJV2BuX2ThH5UaGcdJMstgN/': orcaShiny,
					'ipfs://QmTQFQVUFTNscWvptfC5m3ZHNZ4d8cc8WiRuYBbmXrUpCE/': humpbackStandard,
					'ipfs://QmNgxr5tYhpkUmVzvRnpzGuvYpFdBvMXNasC4MHAtZ2xfo/': humpbackShiny,
					'ipfs://QmQdGNx8ZCdegtvHzvFykZWmgYKNB6dH9Tqg3E39YtuBEz/': spermStandard,
					'ipfs://QmPRkvqRBmpZAcGoML8Secxng3CFwipQiP13Hj7iray7HP/': spermShiny,
					'ipfs://QmPA7KZAaSSxuaeAWjLpCpJZpiry16tZgEtEwy1UhBrXgX/': blueWhaleStandard,
					'ipfs://QmdGKySFeWNpqgsij2vGiHiZU1qYbqevyjgrnmcydecNNe/': blueWhaleShiny,
					'ipfs://QmaEGwr94jusX6snxrytrsiMCrjDZRtAAQUz8uE5Z9NiTz/': goldenWilly
				};

				// Update modal data based on mint success
				modal.title = 'Mint Successful!';
				modal.body = `You have successfully minted your NFT. 
				View it on 
                    <a href="https://sepolia-era.zksync.network/nft/${PUBLIC_NFT_CONTRACT_ADDRESS}/${tokenId}" target="_blank" style="color: blue; text-decoration: underline;">
                        ZkSync Explorer
                    </a>`; // TODO: Dynamically update block explorer
				modal.image = ipfsToLocalImageMap[tokenUri];

				// Trigger modal
				modalStore.trigger(modal);
				unwatchSelfMint();

				isMinting = false;
				$amountMinted = await getAmountMinted();
			}
		});

		try {
			const response = await mintNft();

			if (!response.success) {
				isMinting = false;
				errorMessage = response.message;
			}
		} catch (error) {
			isMinting = false;
			errorMessage = 'Mint error. Please try again.';
			console.error('Error in mint:', error);
		}
	}
</script>

<main class="container mx-auto w-full flex-col justify-center items-center">
	<h2 class="h2 text-center text-xl md:text-4xl text-black font-bold pt-2 md:pt-2">
		zkWilly X Sea Shepherd
	</h2>
	<h2 class="h2 text-center text-xl md:text-4xl text-black font-bold pb-4 md:pb-4 md:pt-0">
		Charity NFT
	</h2>
	<!-- <Countdown targetDate="2024-05-10T12:00:00" on:timerFinished={handleTimerFinished} /> -->
	<Countdown
		{targetDate}
		on:timerFinished={handleTimerFinished}
		on:maxTokensMinted={handleMaxTokensMinted}
		{amountMinted}
	/>
	<div
		class="flex flex-col md:flex-row justify-center items-center overflow-y-auto pt-10 max-h-[500px] md:max-h-[600px]"
	>
		<div
			class="flex flex-col md:flex-row md:justify-center items-center bg-surface-800 bg-opacity-70 w-3/4 md:gap-32 overflow-y-auto"
		>
			<div class="flex flex-col items-center text-sm py-10 w-1/3">
				<a
					href="https://sadanduseless.b-cdn.net/wp-content/uploads/2019/10/puffer-trumps8.jpg"
					rel="noreferrer"
				>
					<img src={mystery} alt="zkWilly" class="w-60 md:w-full pb-2 md:pb-0" />
				</a>
				<button
					class="btn btn-sm md:btn-md variant-filled-secondary mt-2 font-bold w-full rounded-none"
					on:click={mint}
					disabled={!($account.isConnected && timerFinished && !maxTokensMinted) || isMinting}
				>
					{#if isMinting}
						Minting...
					{:else}
						Mint
					{/if}
				</button>
				{#if errorMessage}
					<p class="text-red-500 text-sm font-bold">
						{errorMessage}
					</p>
				{/if}
				<p class="text-white font-bold text-center pb-2 pt-2 md:pt-2">Price: $20</p>
				<p class="text-white text-center text-xs">
					(100% donated to <a href="https://seashepherd.org/" class="text-blue-500 underline pb-4"
						>Sea Shepherd</a
					>)
				</p>
			</div>
			<div class="flex flex-col justify-center items-center md:py-6 text-sm w-4/5 md:w-2/5">
				<p class="text-white font-bold text-center pb-2 md:pb-4 pt-10 md:pt-0">Categories</p>
				<p class="text-white text-center text-xs md:text-sm pb-4 md:pb-4 pt-2 md:pt-0">
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
							<td>Plankton</td>
						</tr>
						<tr>
							<td>&lt 0.2</td>
							<td>Shrimp</td>
						</tr>
						<tr>
							<td>&lt 0.5</td>
							<td>Pufferfish</td>
						</tr>
						<tr>
							<td>&lt 1</td>
							<td>Dolphin</td>
						</tr>
						<tr>
							<td>&lt 3</td>
							<td>Beluga Whale</td>
						</tr>

						<tr>
							<td>&lt 5</td>
							<td>Narwhal</td>
						</tr>
						<tr>
							<td>&lt 10</td>
							<td>Orca</td>
						</tr>
						<tr>
							<td>&lt 20</td>
							<td>Humpback</td>
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

				<p class="text-white text-center text-xs md:text-sm pt-4 md:pt-4">
					10% chance of a rare creature
				</p>
				<p class="text-white text-center text-xs md:text-sm pb-2 md:pb-2 pt-2 md:pt-0">
					1% chance of a legendary creature
				</p>
				<a
					href="https://media.tenor.com/FawYo00tBekAAAAe/loading-thinking.png"
					class="text-blue-500 underline pb-4 md:pb-0"
					target="_blank"
				>
					Contract Details</a
				>
			</div>
		</div>
	</div>
</main>
