<script lang="ts">
	import '../../app.postcss';
	import zkSync_Logo from '../../assets/zkSync_Logo.png';
	import CoinGecko_Logo from '../../assets/CoinGecko_Logo.webp';
</script>

<div class="flex-col text-center pt-20">
	<p class="text-2xl text-black">
		zkWilly is a free service developed by Ethereum enthusiasts We believe
	</p>

	<div class="flex justify-center items-center"></div>
</div>

<div class="flex-col text-center">
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
