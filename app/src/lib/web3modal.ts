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
	PUBLIC_WALLETCONNECT_PROJECT_ID
} from '$env/static/public';
import { zkSync, zkSyncSepoliaTestnet } from '@wagmi/core/chains';
import { Signer, Web3Provider, Provider, utils, types, Wallet } from 'zksync-ethers';
import { ethers } from 'ethers';

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

export const chains = [zkSync, zkSyncSepoliaTestnet];

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

export const mintNft = async () => {
	try {
		const price = await readContract(wagmiConfig, {
			abi,
			address: PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`,
			functionName: 'getEthPrice'
		});

		// Define the payload
		const payload = {
			feeTokenAddress: '0xbbeb516fb02a01611cbbe0453fe3c580d7281011', // ERC20 the user desires to use as gas token
			sponsorshipRatio: 100, // [0-100] which % of the transaction is sponsored by the protocol
			// isTestnet: true,
			txData: {
				from: connectedAddress,
				to: PUBLIC_NFT_CONTRACT_ADDRESS,
				data: '0x14f710fe',
				value: price.toString()
			}
		};

		try {
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
				const errorResponse = await paymasterResponse.text(); // Or .json() if response is in JSON
				console.error('Error response:', errorResponse);
				throw new Error(`HTTP error! status: ${paymasterResponse.status}`);
			}

			// console.log('Paymaster response:', paymasterResponse);

			const data = await paymasterResponse.json();

			console.log('Paymaster data:', data);

			//Get the account and provider from Wagmi
			const account = getAccount(wagmiConfig);
			const provider = await account.connector.getProvider();

			//Create a signer from the provider to send the transaction using zk-ethers
			const web3provider = new Web3Provider(provider);
			const signer = web3provider.getSigner();
			const rawTx = data.txData;

			// let tx = await sendTransaction(wagmiConfig, {
			// 	...rawTx,
			// 	from: connectedAddress
			// });
			//"failed to validate the transaction. reason: Validation revert: Paymaster validation error: ERC20: transfer amount exceeds balance"
			// console.log(signer);

			const tx = await signer.sendTransaction(rawTx);

			// const tx = await wallet.sendTransaction(rawTx);

			// const tx = await signer.sendTransaction({
			// 	to: '0x07FBc30a7d564EF72Eb0A3318c73853579893B65',
			// 	value: 1
			// });

			console.log(tx);
		} catch (error) {
			console.error('Error during the API call:', error);
			console.log(error.transaction);
		}

		// "failed to validate the transaction. reason: Validation revert: Paymaster validation error: ERC20: transfer amount exceeds balance"
		// "failed to validate the transaction. reason: Validation revert: Account validation error: Paymaster validation returned invalid magic value. Please refer to the documentation of the paymaster for more details"
		// "failed to validate the transaction. reason: Validation revert: Account validation error: Paymaster validation returned invalid magic value. Please refer to the documentation of the paymaster for more details"
		// "failed to validate the transaction. reason: Validation revert: Account validation error: Paymaster validation returned invalid magic value. Please refer to the documentation of the paymaster for more details"

		// // Send the transaction

		// 	const tx = await writeContract(wagmiConfig, {
		// 		abi,
		// 		address: PUBLIC_NFT_CONTRACT_ADDRESS,
		// 		functionName: 'mintNFT',
		// 		args: [],
		// 		value: price
		// 	});
		// 	console.log('mintNFT tx', tx);

		// 	// Wait for confirmation
		// 	const txReceipt = await waitForTransactionReceipt(wagmiConfig, { hash: tx });
		// 	console.log('Transaction receipt:', txReceipt);

		// 	// Check transaction status
		// 	if (txReceipt.status === 'success') {
		// 		// 1 indicates a successful transaction
		// 		// Return success response
		// 		return { success: true, message: 'NFT minted successfully', txHash: tx };
		// 	} else {
		// 		// Return error response (consider more detailed error info if possible)
		// 		return { success: false, message: 'Transaction failed' };
		// 	}
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

export const getAmountMinted = async () => {
	try {
		const amountMinted = await readContract(wagmiConfig, {
			abi,
			address: PUBLIC_NFT_CONTRACT_ADDRESS,
			functionName: 'getTotalTokenCount'
		});

		return Number(amountMinted);
	} catch (error) {
		console.error('Error in getAmountMinted:', error);
		return;
	}
};
