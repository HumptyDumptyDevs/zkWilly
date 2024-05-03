import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi';
import {
	getAccount,
	getChainId,
	reconnect,
	watchAccount,
	watchChainId,
	readContract,
	writeContract,
	waitForTransactionReceipt
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
	try {
		const price = await readContract(wagmiConfig, {
			abi,
			address: PUBLIC_NFT_CONTRACT_ADDRESS,
			functionName: 'getEthPrice'
		});

		const tx = await writeContract(wagmiConfig, {
			abi,
			address: PUBLIC_NFT_CONTRACT_ADDRESS,
			functionName: 'mintNFT',
			args: [],
			value: price
		});
		console.log('mintNFT tx', tx);

		// Wait for confirmation
		const txReceipt = await waitForTransactionReceipt(wagmiConfig, { hash: tx });
		console.log('Transaction receipt:', txReceipt);

		// Check transaction status
		if (txReceipt.status === 'success') {
			// 1 indicates a successful transaction
			// Return success response
			return { success: true, message: 'NFT minted successfully', txHash: tx };
		} else {
			// Return error response (consider more detailed error info if possible)
			return { success: false, message: 'Transaction failed' };
		}
	} catch (error) {
		console.error('Error in mintNft:', error);
		return {
			success: false,
			message: 'Error minting. Please try again.'
		};
	}
};

export const getTokenUri = async (tokenId) => {
	try {
		const uri = await readContract(wagmiConfig, {
			abi,
			address: PUBLIC_NFT_CONTRACT_ADDRESS,
			functionName: 'tokenURI',
			args: [tokenId]
		});

		console.log('Token URI for %s is: %s', tokenId, uri);

		return uri; // Return local image path
	} catch (error) {
		console.error('Error in getTokenUri:', error);
		return;
	}
};
