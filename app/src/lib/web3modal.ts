import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi';
import {
	getAccount,
	getChainId,
	reconnect,
	watchAccount,
	watchChainId,
	writeContract
} from '@wagmi/core';
import { readable, writable } from 'svelte/store';
import { abi } from './zkWillyNftAbi';
import { PUBLIC_NFT_CONTRACT_ADDRESS } from '$env/static/public';
import { PUBLIC_WALLETCONNECT_PROJECT_ID } from '$env/static/public';
import { zkSync, zkSyncSepoliaTestnet } from '@wagmi/core/chains';

export const CUSTOM_WALLET = 'wc:custom_wallet';

export const projectId = PUBLIC_WALLETCONNECT_PROJECT_ID;

let storedCustomWallet;
if (typeof window !== 'undefined') {
	storedCustomWallet = localStorage.getItem(CUSTOM_WALLET);
}

const customWallets = storedCustomWallet ? [JSON.parse(storedCustomWallet)] : undefined;

const metadata = {
	name: 'Web3Modal',
	description: 'Web3Modal Example',
	url: 'https://web3modal.com',
	icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export const chains = [zkSync, zkSyncSepoliaTestnet];

export const wagmiConfig = defaultWagmiConfig({
	projectId,
	chains,
	metadata,
	enableCoinbase: false,
	enableInjected: false
});

reconnect(wagmiConfig);

createWeb3Modal({
	wagmiConfig,
	projectId,
	themeMode: 'light',
	themeVariables: {
		'--w3m-font-family': 'Monospace',
		'--w3m-accent': '#7777ff'
	},
	featuredWalletIds: [],
	enableAnalytics: true,
	customWallets
});

export const chainId = readable(getChainId(wagmiConfig), (set) =>
	watchChainId(wagmiConfig, { onChange: set })
);
export const account = readable(getAccount(wagmiConfig), (set) =>
	watchAccount(wagmiConfig, { onChange: set })
);
export const provider = readable<unknown | undefined>(undefined, (set) =>
	watchAccount(wagmiConfig, {
		onChange: async (account) => {
			if (!account.connector) return set(undefined);
			set(await account.connector?.getProvider());
		}
	})
);

export const customWallet = writable({
	id: undefined,
	name: undefined,
	homepage: undefined,
	image_url: undefined,
	mobile_link: undefined,
	desktop_link: undefined,
	webapp_link: undefined,
	app_store: undefined,
	play_store: undefined
});

export const supported_chains = writable<string[]>([]);

export const mintNft = async () => {
	const tx = await writeContract(wagmiConfig, {
		abi,
		address: PUBLIC_NFT_CONTRACT_ADDRESS,
		functionName: 'mintNFT',
		args: []
	});

	console.log('mintNFT tx', tx);
};
