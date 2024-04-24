<script lang="ts">
	import '../app.postcss';
	import zkWillyLogo from '../assets/zkWilly_Logo.png';
	import zkWillyWordmark from '../assets/zkWilly_Wordmark.png';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import '../lib/web3modal';
</script>

<main class="mx-auto h-full bg-cover" style="background-image: url(/zkWilly_Background_3.png);">
	<AppShell>
		<svelte:fragment slot="header">
			<AppBar
				gridColumns="grid-cols-2 mx-auto md:mx-0"
				slotDefault="place-self-start"
				slotTrail="place-content-end"
				background="background-image: url(/zkWilly_Background.png);"
			>
				<a href="/" rel="noreferrer">
					<img src={zkWillyWordmark} alt="zkWilly" class="md:mx-20 w-60 md:w-80" />
				</a>
				<svelte:fragment slot="trail">
					<div class="flex justify-between bg-white p-2 rounded-full">
						<a
							href="/nft"
							rel="noreferrer"
							class="btn btn-sm md:btn-md variant-filled-secondary m-1 font-bold"
							data-sveltekit-preload-data="hover">NFT</a
						>
						<a
							href="/about"
							rel="noreferrer"
							class="btn btn-sm md:btn-md variant-filled-secondary m-1 font-bold"
							data-sveltekit-preload-data="hover">About</a
						>
						<w3m-button class="m-1" />
						<div></div>
					</div></svelte:fragment
				>
			</AppBar>
		</svelte:fragment>
		<div class="w-full"><slot /></div>
		<svelte:fragment slot="pageFooter">
			<main class="container mx-auto w-full">
				<div class="pb-10 px-8 md:px-20">
					<div class="flex justify-center">
						<div class="flex flex-col text-center">
							<a href="https://en.wikipedia.org/wiki/Keiko_(orca)" rel="noreferrer">
								<img src={zkWillyLogo} alt="zkWilly" class="mx-20 w-16" />
							</a>
							<p class="text-sm">© 2024 zkWilly</p>
							<a href="https://x.com/hddevs" rel="noreferrer"
								><p class="text-sm">@HumptyDumptyDevs</p></a
							>
						</div>
						<div class="flex"></div>
					</div>
				</div>
			</main>
		</svelte:fragment>
	</AppShell>
</main>
