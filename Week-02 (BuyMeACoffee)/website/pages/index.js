import abi from '../utils/BuyMeACoffee.json';
import { ethers } from 'ethers';
import Head from 'next/head';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
	// Contract Address & ABI
	const contractAddress = '0x507587d3c5EDb117e44DdB36DF14629FCF8321eE';
	const contractABI = abi.abi;

	// Component state
	const [currentAccount, setCurrentAccount] = useState('');
	const [name, setName] = useState('');
	const [message, setMessage] = useState('');
	const [memos, setMemos] = useState([]);

	const onNameChange = event => {
		setName(event.target.value);
	};

	const onMessageChange = event => {
		setMessage(event.target.value);
	};

	// Wallet connection logic
	const isWalletConnected = async () => {
		try {
			const { ethereum } = window;

			const accounts = await ethereum.request({ method: 'eth_accounts' });
			console.log('accounts: ', accounts);

			if (accounts.length > 0) {
				const account = accounts[0];
				console.log('wallet is connected! ' + account);
			} else {
				console.log('make sure MetaMask is connected');
			}
		} catch (error) {
			console.log('error: ', error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('please install MetaMask');
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const buyCoffee = async (amount) => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum, 'any');
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				console.log('buying coffee..');
				const coffeeTxn = await buyMeACoffee.buyCoffee(
					name ? name : 'anon',
					message ? message : 'Enjoy your coffee!',
					{ value: ethers.utils.parseEther(amount) }
				);

				await coffeeTxn.wait();

				console.log('mined ', coffeeTxn.hash);

				console.log('coffee purchased!');

				// Clear the form fields.
				setName('');
				setMessage('');
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Function to fetch all memos stored on-chain.
	const getMemos = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				console.log('fetching memos from the blockchain..');
				const memos = await buyMeACoffee.getMemos();
				console.log('fetched!');
				setMemos(memos);
			} else {
				console.log('Metamask is not connected');
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		let buyMeACoffee;
		isWalletConnected();
		getMemos();

		// Create an event handler function for when someone sends
		// us a new memo.
		const onNewMemo = (from, timestamp, name, message) => {
			console.log('Memo received: ', from, timestamp, name, message);
			setMemos(prevState => [
				...prevState,
				{
					address: from,
					timestamp: new Date(timestamp * 1000),
					message,
					name
				}
			]);
		};

		const { ethereum } = window;

		// Listen for new memo events.
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum, 'any');
			const signer = provider.getSigner();
			buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

			buyMeACoffee.on('NewMemo', onNewMemo);
		}

		return () => {
			if (buyMeACoffee) {
				buyMeACoffee.off('NewMemo', onNewMemo);
			}
		};
	}, []);

	return (
		<div className="justify-center items-center">
      
      	<Head>
        	<title>Buy Killiane a Coffee!</title>
			<meta name="description" content="Tipping site" />
			<link rel="icon" href="/favicon.ico" />
		</Head>

    	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 justify-center items-center h-full bg-[#8A624A] sm:px-12 md:px-32 lg:px-64 xl:px-64 p-10">
        	<div className="w-full">
          		<h2 className="text-5xl font-bold text-white">
            		Buy Killiane a Coffee!
          		</h2>
         		 <p className="mt-10 font-bold text-white">
           			Great idea start with a great coffee!
          		</p>
          		{currentAccount ? (
            		<p className="text-xl font-bold mt-10 text-white">
              			✅ You are all set!
            		</p>
          		) : (
            		<button className="w-full rounded-lg bg-[#d0bb94] mt-10 py-3 text-l font-semibold hover:bg-[#ac7b58] text-white" type="button" onClick={connectWallet}> Connect your wallet </button>
				)}
        	</div>
        	<div className="w-full hidden md:block">
          		<img
				  src="https://zupimages.net/up/22/19/eme4.png"
				  alt="..."
				/>
          	</div>
      	</div>

      	<div className="p-10 bg-[#8A624A]">
        	<h1 className="pb-6 text-center text-2xl font-bold text-white">Choose the size of your coffee</h1>
      		<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        		<div className="rounded-lg overflow-hidden shadow-lg bg-[#d0bb94]">
          			<div className="flex flex-wrap justify-center">
            			<div className="w-6/12 sm:w-4/12 px-4">
              				<img
							  src="https://zupimages.net/up/22/19/63x9.png"
							  alt="..."
							  className="shadow-lg rounded-full max-w-full h-auto align-middle border-none mt-6"
							/>
            			</div>
          			</div>
          		<div className="px-6 py-4">
        	<div className="text-center text-[#8A624A] font-bold text-xl mb-2">Little Coffee</div>
				<p className="text-gray-700 text-base text-justify">
                	A little coffee to start the day! The fatigue of the previous night of learning will soon be a thing of the past!
              	</p>
            </div>
            <div className="px-6 pb-4">
              	{currentAccount ? (
					<div>
						<form>
							<div>
								<label className="text-l font-bold text-[#8A624A] mb-2">Name</label>
								<br />
								<input
                        			className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
									id="name"
									type="text"
									placeholder="Bruce"
									onChange={onNameChange}
								/>
							</div>
							<br />
                    		<div>
								<label className="text-l font-bold text-[#8A624A] mb-2">Send Killiane a message</label>
								<br />
								<textarea
                        			className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
									rows={3}
									placeholder="Enjoy your little coffee!"
									id="message"
									onChange={onMessageChange}
									required
                      			/>
							</div>
							<div>
                      			<br />
                      			<button className="w-full rounded-lg bg-[#ac7b58] py-3 text-l font-semibold hover:bg-[#8b6245] text-white" type="button" onClick={() => buyCoffee("0.001")}>
									Send 1 little coffee for 0.001ETH
								</button>
							</div>
                  		</form>
                	</div>
              	) : (
                	<button className="w-full rounded-lg bg-[#ac7b58] py-3 text-l font-semibold hover:bg-[#8b6245] text-white" type="button" onClick={connectWallet}> Connect your wallet </button>
              	)}
			</div>
		</div>
          
		<div className="rounded-lg overflow-hidden shadow-lg bg-[#d0bb94]">
			<div className="flex flex-wrap justify-center">
              	<div className="w-6/12 sm:w-4/12 px-4">
                	<img
						src="https://zupimages.net/up/22/19/hyny.png"
						alt="..."
						className="shadow-lg rounded-full max-w-full h-auto align-middle border-none mt-6"
					/>
              	</div>
            </div>
            <div className="px-6 py-4">
              	<div className="text-center text-[#8A624A] font-bold text-xl mb-2">Medium Coffee</div>
                	<p className="text-gray-700 text-base text-justify">
                  		{"A good medium coffee to reboost is needed, there is nothing like it! A medium coffee and we're back at it!"}
                	</p>
              	</div>

              	<div className="px-6 pb-4">
                	{currentAccount ? (
						<div>
							<form>
								<div>
									<label className="text-l font-bold text-[#8A624A] mb-2">Name</label>
									<br />
									<input
										className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										id="name"
										type="text"
										placeholder="Bruce"
										onChange={onNameChange}
									/>
								</div>
								<br />
                    			<div>
									<label className="text-l font-bold text-[#8A624A] mb-2">Send Killiane a message</label>
									<br />
									<textarea
                        				className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										rows={3}
										placeholder="Enjoy your medium coffee!"
										id="message"
										onChange={onMessageChange}
										required
                      				/>
								</div>
								<div>
                      				<br />
									<button className="w-full rounded-lg bg-[#ac7b58] py-3 text-l font-semibold hover:bg-[#8b6245] text-white" type="button" onClick={() => buyCoffee("0.002")}>
										Send 1 medium coffee for 0.002ETH
									</button>
								</div>
                  			</form>
						</div>
                	) : (
                  		<button className="w-full rounded-lg bg-[#ac7b58] py-3 text-l font-semibold hover:bg-[#8b6245] text-white" type="button" onClick={connectWallet}> Connect your wallet </button>
					)}
              	</div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-lg bg-[#d0bb94]">
              	<div className="flex flex-wrap justify-center">
                	<div className="w-6/12 sm:w-4/12 px-4">
                  		<img
							src="https://zupimages.net/up/22/19/d52q.png"
							alt="..."
							className="shadow-lg rounded-full max-w-full h-auto align-middle border-none mt-6"
						/>
                	</div>
              	</div>
            	<div className="px-6 py-4">
              		<div className="text-center text-[#8A624A] font-bold text-xl mb-2">Large Coffee</div>
                		<p className="text-gray-700 text-base text-justify">
                  			The day was very hard, a last boost is needed to finish it! A large coffee to keep us going and boost our motivation is needed!
                		</p>
              		</div>
              		<div className="px-6 pb-4">
                		{currentAccount ? (
							<div>
						      	<form>
							      	<div>
								      	<label className="text-l font-bold text-[#8A624A] mb-2">Name</label>
								      	<br />
								      	<input
                        					className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
									      	id="name"
									      	type="text"
									      	placeholder="Bruce"
									      	onChange={onNameChange}
								      	/>
							      	</div>
							      	<br />
                    				<div>
								      	<label className="text-l font-bold mb-2 text-[#8A624A]">Send Killiane a message</label>
								      	<br />
								      	<textarea
                        					className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
									      	rows={3}
									      	placeholder="Enjoy your large coffee!"
									      	id="message"
									      	onChange={onMessageChange}
									      	required
                      					/>
									</div>
							      	<div>
										<br />
                      					<button className="w-full rounded-lg bg-[#ac7b58] py-3 text-l font-semibold hover:bg-[#8b6245] text-white" type="button" onClick={() => buyCoffee("0.003")}>
											Send 1 large coffee for 0.003ETH
								      	</button>
                    				</div>
                  				</form>
                			</div>
                		) : (
                  			<button className="w-full rounded-lg bg-[#ac7b58] py-3 text-l font-semibold hover:bg-[#8b6245] text-white" type="button" onClick={connectWallet}> Connect your wallet </button>
						)}
              		</div>
            	</div>
          	</div>
        </div>

      	<div className="bg-[#8A624A] p-6 justify-center">

			{currentAccount && <h1 className="text-center text-2xl font-bold text-white">Memos received</h1>}

			{currentAccount &&
				memos.map((memo, idx) => {
				return (
					<div
						key={idx}
						className="xl:mx-72 text-center bg-[#d0bb94] border-solid border-2 border-[#ac7b58] rounded-lg p-5 m-5"
					>
						<p className="font-bold text-[#8A624A]">&quot;{memo.message}&quot;</p>
						<p className="font-semibold text-gray-700">
							From: {memo.name} at {memo.timestamp.toString()}
					</p>
					</div>
				);
			})}
        </div>

		<footer className="flex justify-center text-center items-center p-6 bg-[#d0bb94]">
			<a
				href="https://twitter.com/kmenand"
				target="_blank"
				rel="noopener noreferrer"
          		className="font-semibold text-gray-700"
			>
				{"Created by @kmenand for Alchemy's Road to Web3 Week 02!"}
			</a>
		</footer>
	</div>
	);
}
