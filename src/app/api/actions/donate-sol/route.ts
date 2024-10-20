import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
} from '@solana/actions';
import { ethers } from 'ethers';

const headers = createActionHeaders();

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { toAddress } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/solana-actions/donate-sol?to=${toAddress}`,
      requestUrl.origin,
    ).toString();

    const payload: any = {
      isEthereum: true,
      type: 'action',
      title: 'Donate SOL to Alice',
      icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
      description:
        'Cybersecurity Enthusiast | Support my research with a donation.',
      label: 'Transfer', // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: 'Send 1 SOL', // button text
            href: `${baseHref}&amount=${'1'}`,
          },
          {
            label: 'Send 5 SOL', // button text
            href: `${baseHref}&amount=${'5'}`,
          },
          {
            label: 'Send 10 SOL', // button text
            href: `${baseHref}&amount=${'10'}`,
          },
          {
            label: 'Send SOL', // button text
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

    const body: ActionPostRequest = await req.json();

    // Validate the client provided input
    let fromAddress: string;
    try {
      fromAddress = ethers.getAddress(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    // Create a provider (you may want to use a different provider based on your setup)
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');

    // Get the current nonce for the fromAddress
    const nonce = await provider.getTransactionCount(fromAddress, 'pending');

    // Get the current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

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
    };

    // Serialize the transaction
    const serializedTx = ethers.Transaction.from(transaction).serialized;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        // @ts-ignore
        transaction: serializedTx,
        message: `Prepared transaction to send ${amount} ETH to ${toAddress}`,
      },
    });

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

function validatedQueryParams(requestUrl: URL) {
  let toAddress: string = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  let amount: number = 0.1;

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
