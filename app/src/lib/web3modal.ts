import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi';
import {
	http,
	getAccount,
	getChainId,
	reconnect,
	watchAccount,
	watchChainId,
	readContract,
	writeContract,
	waitForTransactionReceipt,
	sendTransaction
} from '@wagmi/core';
import { readable, writable } from 'svelte/store';
import { encodeFunctionData } from 'viem';
import { createWalletClient, custom } from 'viem';
import { abi } from './zkWillyNftAbi';
import {
	PUBLIC_ALCHEMY_ZKSYNC_SEPOLIA_RPC,
	PUBLIC_ALCHEMY_ZKSYNC_MAINNET_RPC,
	PUBLIC_NFT_CONTRACT_ADDRESS,
	PUBLIC_WALLETCONNECT_PROJECT_ID,
	PUBLIC_WBTC_CONTRACT_ADDRESS
} from '$env/static/public';
import { zkSync, zkSyncSepoliaTestnet, type Chain } from '@wagmi/core/chains';
import { Web3Provider } from 'zksync-ethers';

export const CUSTOM_WALLET = 'wc:custom_wallet';
export const projectId = PUBLIC_WALLETCONNECT_PROJECT_ID;

let storedCustomWallet;
if (typeof window !== 'undefined') {
	storedCustomWallet = localStorage.getItem(CUSTOM_WALLET);
}

const customWallets = storedCustomWallet ? [JSON.parse(storedCustomWallet)] : undefined;

// MetaMask requires requesting permission to connect users accounts

const metadata = {
	name: 'Web3Modal',
	description: 'Web3Modal Example',
	url: 'https://web3modal.com',
	icons: ['https://avatars.githubusercontent.com/u/37784886']
};

//@ts-ignore
export const chains: readonly [Chain, ...Chain[]] = [zkSync, zkSyncSepoliaTestnet];

export const wagmiConfig = defaultWagmiConfig({
	projectId,
	chains,
	transports: {
		[zkSync.id]: http(PUBLIC_ALCHEMY_ZKSYNC_MAINNET_RPC),
		[zkSyncSepoliaTestnet.id]: http(PUBLIC_ALCHEMY_ZKSYNC_SEPOLIA_RPC)
	},
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

let connectedAddress: `0x${string}` | undefined = undefined;

account.subscribe((acc) => {
	connectedAddress = acc.address;
});

let payMasterAttempted = false;

export const mintNft = async () => {
	const price = await readContract(wagmiConfig, {
		abi,
		address: PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`,
		functionName: 'getEthPrice'
	});
	if (payMasterAttempted === false) {
		try {
			// Define the payload for the paymaster attempt
			const payload = {
				feeTokenAddress: PUBLIC_WBTC_CONTRACT_ADDRESS, // ERC20 the user desires to use as gas token
				sponsorshipRatio: 100, // [0-100] which % of the transaction is sponsored by the protocol
				txData: {
					from: connectedAddress,
					to: PUBLIC_NFT_CONTRACT_ADDRESS,
					data: encodeFunctionData({
						abi,
						functionName: 'mintNFT',
						args: []
					}),
					value: price.toString()
				}
			};

			// Try minting with paymaster
			const paymasterResponse = await fetch(
				'https://api.zyfi.org/api/erc20_sponsored_paymaster/v1',
				{
					method: 'POST',
					body: JSON.stringify(payload),
					headers: {
						'Content-Type': 'application/json',
						'X-API-KEY': '496dd6ee-6c47-43ad-beb5-65e54387a5b2'
					}
				}
			);

			if (!paymasterResponse.ok) {
				const errorResponse = await paymasterResponse.text();
				console.error('Paymaster Error response:', errorResponse);
				throw new Error(`HTTP error from paymaster! status: ${paymasterResponse.status}`);
			}

			const data = await paymasterResponse.json();

			const provider = await getAccount(wagmiConfig).connector?.getProvider();
			const web3provider = new Web3Provider(provider);
			const signer = web3provider.getSigner();
			const tx = await signer.sendTransaction(data.txData);

			return { success: true, message: 'NFT minted successfully with Paymaster', txHash: tx.hash };
		} catch (error) {
			console.error('Error during the paymaster mint attempt:', error);
			payMasterAttempted = true; // Mark that paymaster was attempted
			return {
				success: false,
				message: 'Attempt with Paymaster failed, please try to mint yourself.'
			};
		}
	} else {
		try {
			const tx = await writeContract(wagmiConfig, {
				abi,
				address: PUBLIC_NFT_CONTRACT_ADDRESS,
				functionName: 'mintNFT',
				args: [],
				value: price
			});

			const txReceipt = await waitForTransactionReceipt(wagmiConfig, { hash: tx });

			if (txReceipt.status === 'success') {
				return {
					success: true,
					message: 'NFT minted successfully without Paymaster',
					txHash: tx
				};
			} else {
				throw new Error('Transaction failed without Paymaster');
			}
		} catch (secondAttemptError) {
			console.error('Error during non-paymaster mint attempt:', secondAttemptError);
			return { success: false, message: 'Both attempts failed; please try minting again.' };
		}
	}
};

export const getTokenUri = async (tokenId) => {
	try {
		const uri = await readContract(wagmiConfig, {
			abi,
			address: PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`,
			functionName: 'tokenURI',
			args: [tokenId]
		});

		return uri; // Return local image path
	} catch (error) {
		console.error('Error in getTokenUri:', error);
		return;
	}
};

export const getAmountMinted = async () => {
	try {
		const amountMinted = await readContract(wagmiConfig, {
			abi,
			address: PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`,
			functionName: 'getTotalTokenCount'
		});

		return Number(amountMinted);
	} catch (error) {
		console.error('Error in getAmountMinted:', error);
		return;
	}
};
