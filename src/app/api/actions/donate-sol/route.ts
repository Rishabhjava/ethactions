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
    const { toAddress } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/actions/donate-sol?to=${toAddress}`,
      requestUrl.origin,
    ).toString();

    const payload: any = {
      isEthereum: true,
      chain: '0x' + BigInt(31).toString(16),
      type: 'action',
      title: 'Donate SOL to Alice',
      icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
      description:
        'Cybersecurity Enthusiast | Support my research with a donation.',
      label: 'Transfer', // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: 'Send 0.000001 rBTC', // button text
            href: `${baseHref}&amount=${'0.000001'}`,
          },
          {
            label: 'Send 0.000005 rBTC', // button text
            href: `${baseHref}&amount=${'0.000005'}`,
          },
          {
            label: 'Send 0.00001 rBTC', // button text
            href: `${baseHref}&amount=${'0.00001'}`,
          },
          {
            label: 'Send rBTC', // button text
            href: `${baseHref}&amount={amount}`, // this href will have a text input
            parameters: [
              {
                name: 'amount', // parameter name in the `href` above
                label: 'Enter the amount of SOL to send', // placeholder of the text input
                required: true,
              },
            ],
          },
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
    const provider = new ethers.JsonRpcProvider('https://public-node.testnet.rsk.co');

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

  return {
    amount,
    toAddress,
  };
}
