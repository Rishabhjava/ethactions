import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
} from '@solana/actions';
import { ethers } from 'ethers';

const headers = createActionHeaders({
  chainId: 'mainnet',
  actionVersion: '2.2.1',
});


export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { imageUrl, toAddress } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/actions/mint-skale?to=${toAddress}`,
      requestUrl.origin,
    ).toString();

    const payload: any = {
      isEthereum: true,
      chain: '0x' + BigInt(974399131).toString(16),
      type: 'action',
      title: 'Mint this Image as an NFT!',
      icon: imageUrl,
      description:
        'Support this creator by minting their Tweet as an NFT!',
      label: 'Transfer', // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: 'Mint for 5 AMB', // button text
            href: `${baseHref}&amount=${'5'}`,
          }
        ],
      },
    };

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let message = 'An unknown error occurred';
    if (typeof err == 'string') message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async (req: Request) => {
  return new Response(null, { headers });
};

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { amount, toAddress } = validatedQueryParams(requestUrl);
    console.log( 'new amount', amount, 'toAddress', toAddress);
    const body: ActionPostRequest = await req.json();

    // Validate the client provided input
    let fromAddress: string;
    try {
      fromAddress = body.account;
      console.log('fromAddress', fromAddress);
    } catch (err) {
      console.log('err in body.account', err);
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }


    // Create a provider (you may want to use a different provider based on your setup)
    const provider = new ethers.JsonRpcProvider('https://testnet.skalenodes.com/v1/giant-half-dual-testnet');

    // Get the current nonce for the fromAddress
    const nonce = await provider.getTransactionCount(fromAddress, 'pending');
    console.log('nonce', nonce);
    // Get the current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log('gasPrice', gasPrice);
    // Estimate the gas limit
    const gasLimit = await provider.estimateGas({
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
      from: fromAddress,
    });

    // Construct the transaction
    const transaction = {
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      nonce: nonce,
      chainId: (await provider.getNetwork()).chainId,
      data: '0x'
    };

    // Serialize the transaction
    const serializedTx = ethers.Transaction.from(transaction).unsignedSerialized;
    console.log('serializedTx', serializedTx);

    const payload: any = {
      //@ts-ignore
      transaction: serializedTx,
      message: `Prepared transaction to send ${amount} ETH to ${toAddress}`,
    };
    console.log('BIG PAYLOAD', payload);
    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let message = 'An unknown error occurred';
    if (typeof err == 'string') message = err;
    return new Response(message, {
      status: 400,
      headers
    });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let toAddress: string = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  let amount: number = 0.000001;
  let imageUrl: string = '';
  try {
    if (requestUrl.searchParams.get('to')) {
      toAddress = requestUrl.searchParams.get('to')!;
    }
  } catch (err) {
    throw 'Invalid input query parameter: to';
  }

  try {
    if (requestUrl.searchParams.get('amount')) {
      amount = parseFloat(requestUrl.searchParams.get('amount')!);
    }

    if (amount <= 0) throw 'amount is too small';
  } catch (err) {
    throw 'Invalid input query parameter: amount';
  }

  try {
    if (requestUrl.searchParams.get('imageUrl')) {
      imageUrl = requestUrl.searchParams.get('imageUrl')!;
    }
  } catch (err) {
    throw 'Invalid input query parameter: imageUrl';
  }

  return {
    amount,
    toAddress,
    imageUrl,
  };
}
