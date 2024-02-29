import { supabase } from '$lib/supabaseClient';

export async function load() {
	const currentTime = new Date();
	const oneHourAgo = new Date(currentTime.getTime() - 1 * 60 * 60 * 1000);

	console.log('Fetching whale alerts...');
	const { data } = await supabase
		.from('whale_alert')
		.select()
		.gte('classification', 5)
		.limit(100)
		.order('valueEth', { ascending: false });

	return {
		txns: data ?? []
	};
}
