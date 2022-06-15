import Web3 from 'web3';
const web3 = new Web3();

interface AbiInput {
    name: string;
    type: string;
    indexed?: boolean;
	components?: AbiInput[];
    internalType?: string;
}

interface AbiOutput {
    name?: string;
    type: string;
	components?: AbiOutput[];
    internalType?: string;
}

interface AbiItem {
    anonymous?: boolean;
    constant?: boolean;
    inputs?: AbiInput[];
    name?: string;
    outputs?: AbiOutput[];
    payable?: boolean;
    stateMutability?: string;
    type: string;
    gas?: number;
}

const  createContract = <T>(abi: Array<AbiItem>): T => {
    const contract = new web3.eth.Contract(abi as any);
    return contract.methods;
}

export default createContract;