<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';
	import xLogo from '../assets/X_Logo.png';

	export let data;

	let timeValue = 5;
	const timeConversionMap = new Map([
		[0, 1 * 60 * 60 * 1000],
		[1, 12 * 60 * 60 * 1000],
		[2, 24 * 60 * 60 * 1000],
		[3, 7 * 24 * 60 * 60 * 1000],
		[4, 30 * 24 * 60 * 60 * 1000],
		[5, 0]
	]);

	let allTxns: boolean = false;

	// $: allTxns && loadData(allTxns, timeConversionMap.get(timeValue)!);

	async function fetchData(allTxns: boolean, timeRange: number) {
		let classification = 5;
		if (allTxns) {
			classification = 0;
		}
		if (timeRange === 0) {
			// ALL
			const { data: newData } = await supabase
				.from('whale_alert')
				.select()
				.limit(100)
				.gte('classification', classification)
				.order('valueEth', { ascending: false });

			return newData ?? [];
		} else {
			const currentTime = new Date();
			const startTime = new Date(currentTime.getTime() - timeRange);

			const { data: newData } = await supabase
				.from('whale_alert')
				.select()
				.gte('classification', classification)
				.gte('created_at', startTime.toISOString())
				.limit(100)
				.order('valueEth', { ascending: false });

			return newData ?? [];
		}
	}

	async function loadData(allTxns: boolean = false, timeRange: number) {
		const newData = await fetchData(allTxns, timeRange);
		data = { txns: newData };
	}

	function truncate(text: string) {
		const endChars = 4; // Keep default of 4 ending characters
		const maxChars = 42 / 3; // Or any desired maximum length
		const totalChars = Math.min(maxChars, text.length); // Ensure totalChars is within limits

		const start = text.slice(0, totalChars - endChars);
		const end = endChars > 0 ? text.slice(-endChars) : '';

		if (start.length + end.length < text.length) {
			return start + '…' + end;
		} else {
			return text;
		}
	}
</script>

<main class="container mx-auto w-full">
	<div class="flex flex-col items-center">
		<h2 class="h2 text-center text-black font-bold pb-2 md:pb-4 pt-10 md:pt-0">
			zkSync Whale Tracker
		</h2>
		<p class="text-center pb-2 md:pb-6 text-md md:text-lg md:text-2xl text-black">
			Follow us on X for alerts
		</p>
		<a href="https://x.com/zkwilly" rel="noreferrer">
			<img src={xLogo} alt="zkWilly" class="w-8 md:w-12 mx-10" />
		</a>
	</div>
	<!-- RadioGroup for different time ranges -->
	<div
		class="space-x-4 pt-8 md:pt-16 pb-2 md:w-3/4 mx-auto flex flex-col items-center md:flex-row md:justify-between"
	>
		<div class="flex items-center pb-2 md:pb-0">
			<p class="pr-2 text-black font-extrabold">All Fish</p>
			<SlideToggle
				name="slide"
				bind:checked={allTxns}
				background="bg-surface-200"
				active="bg-success-500"
				size="md"
				on:click={() => loadData(!allTxns, timeConversionMap.get(timeValue) || 0)}
			/>
		</div>
		<RadioGroup
			bind:group={timeValue}
			display="flex"
			padding="px-2"
			gap="gap-0"
			background="bg-surface-800"
		>
			<RadioItem
				bind:group={timeValue}
				name="time-range"
				value={0}
				on:change={() => loadData(allTxns, timeConversionMap.get(timeValue) || 0)}>1H</RadioItem
			>
			<RadioItem
				bind:group={timeValue}
				name="time-range"
				value={1}
				on:change={() => loadData(allTxns, timeConversionMap.get(timeValue) || 0)}>12H</RadioItem
			>
			<RadioItem
				bind:group={timeValue}
				name="time-range"
				value={2}
				on:change={() => loadData(allTxns, timeConversionMap.get(timeValue) || 0)}>1D</RadioItem
			>
			<RadioItem
				bind:group={timeValue}
				name="time-range"
				value={3}
				on:change={() => loadData(allTxns, timeConversionMap.get(timeValue) || 0)}>7D</RadioItem
			>
			<RadioItem
				bind:group={timeValue}
				name="time-range"
				value={4}
				on:change={() => loadData(allTxns, timeConversionMap.get(timeValue) || 0)}>30D</RadioItem
			>
			<RadioItem
				bind:group={timeValue}
				name="time-range"
				value={5}
				on:change={() => loadData(allTxns, 0)}>ALL</RadioItem
			>
		</RadioGroup>
	</div>
	<div class="table-container w-3/4 mx-auto overflow-y-auto max-h-[300px] md:max-h-[400px]">
		<!-- Native Table Element -->
		<table class="relative table-auto w-full text-sm table-hover bg-surface-800 bg-opacity-70">
			<thead class="sticky top-0 text-sm text-left px-2 bg-surface-800">
				<tr>
					<th>Time</th>
					<th>Txn Hash</th>
					<th>ETH</th>
					<th>USD</th>
					<th>To</th>
					<th>From</th>
				</tr>
			</thead>
			<tbody>
				{#each data.txns as txn}
					<tr>
						<td>{new Date(txn.created_at).toLocaleString().replace(',', ' ')}</td>
						<td>
							<a
								href="https://explorer.zksync.io/tx/{txn.txnHash}"
								class="text-blue-500 underline"
								target="_blank"
							>
								{truncate(txn.txnHash)}
							</a>
						</td>
						<td>{txn.valueEth.toFixed(4)}</td>
						<td>{txn.valueUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
						<td>
							<a
								href="https://explorer.zksync.io/address/{txn.fromAddress}"
								class="text-blue-500 underline"
								target="_blank"
							>
								{truncate(txn.fromAddress)}
							</a>
						</td>
						<td>
							<a
								href="https://explorer.zksync.io/address/{txn.toAddress}"
								class="text-blue-500 underline"
								target="_blank"
							>
								{truncate(txn.toAddress)}
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
