import { ethers } from 'ethers';
import { abi } from './zkWillyNftAbi';
import { PUBLIC_NFT_CONTRACT_ADDRESS } from '$env/static/public';

export function getNftContract(signer: ethers.Signer) {
	const address = PUBLIC_NFT_CONTRACT_ADDRESS;
	return new ethers.Contract(address, abi, signer);
}
