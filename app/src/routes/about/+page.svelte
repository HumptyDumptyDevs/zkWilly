<script lang="ts">
	import '../../app.postcss';
	import zkSync_Logo from '../../assets/zkSync_Logo.png';
	import CoinGecko_Logo from '../../assets/CoinGecko_Logo.png';
</script>

<div
	class="flex-col text-md md:text-2xl text-black font-bold text-center pt-6 md:pt-40 break-words"
>
	<p class=" pb-2">zkWilly is a free service developed by</p>
	<a href="https://x.com/hddevs" rel="noreferrer"><p class="pb-10">@HumptyDumptyDevs</p></a>
	<p class=" pb-10">We are crypto enthusiasts building various web2 & web3 solutions</p>
	<p class=" pb-4">You can reach us at:</p>
	<p class=" pb-10">humptydumptydevs@gmail.com</p>
	<p class=" pb-4">If you like the service, please consider supporting Sea Shepherd:</p>
	<p class=" pb-10">https://seashepherd.org/donate-with-crypto/</p>
</div>

<div class="flex-col text-center pt-10">
	<p class="text-2xl text-black font-bold">Powered by:</p>

	<div class="flex justify-center items-center">
		<a href="https://zksync.io" rel="noreferrer">
			<img src={zkSync_Logo} alt="zkSync" class="w-40" />
		</a>
		<a href="https://www.coingecko.com/" rel="noreferrer">
			<img src={CoinGecko_Logo} alt="CoinGecko" class="w-40" />
		</a>
	</div>
</div>
