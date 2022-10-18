import React, { useState } from 'react';
import Web3 from 'web3';
// import swal from 'sweetalert';
import WalletConnectProvider from '@walletconnect/web3-provider';

function Wallet() {
    const [walletAddress, setWalletAddress] = useState();
    // const [walletBalance, setWalletBalance] = useState();

    let web3 = new Web3("https://rinkeby.infura.io/v3/226f64dae96f4af5ba03c6aab534de15");
    let provider;

    const metamaskAccount = async () => {
        if (window.ethereum.providers !== undefined) {
            const metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
            if (metamaskProvider.isMetaMask) {
                provider = metamaskProvider;
                provider.enable().then(async (address) => {
                    setWalletAddress(address);
                    // setWalletBalance((await web3.eth.getBalance(address[0])) / 10 ** 18);
                });
            }
        } else {
            // swal("Please Install Metamask Wallet", { buttons: false, icon: "warning" });
        }
    }

    const coinbaseAccount = async () => {
        if (window.ethereum.providers !== undefined) {
            const coinbaseWalletProvider = window.ethereum.providers.find((provider) => provider.isCoinbaseWallet);
            if (coinbaseWalletProvider.isCoinbaseWallet) {
                provider = window.ethereum.providers;
                provider[0].enable().then(async (address) => {
                    setWalletAddress(address);
                    // setWalletBalance((await web3.eth.getBalance(address[0])) / 10 ** 18);
                });
            }
        } else {
            // swal("Please Install Coinbase Wallet", {
            //     buttons: false,
            //     icon: "warning"
            // });
        }
    }

    const trustAccount = async () => {
        if (window.ethereum.providers !== undefined) {
            await window.ethereum.enable();
            const trustWalletProvider = await window.ethereum.providers.find((provider) => provider.isTrustWallet);
            if (trustWalletProvider.isTrustWallet) {
                provider = window.ethereum.providers;
                provider[2].enable().then(async (address) => {
                    setWalletAddress(address);
                    // setWalletBalance((await web3.eth.getBalance(address[0])) / 10 ** 18);
                });
            }
        } else {
            // swal("Please Install Trust Wallet", {
            //     buttons: false,
            //     icon: "warning"
            // });
        }
    }

    const providers = new WalletConnectProvider({
        rpc: {
            97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        }
    });

    const connectWalletConnect = async () => {
        if (!providers.connected) {
            await providers.enable();
            const { accounts } = providers;
            const address = accounts[0];
            setWalletAddress(address);
            // setWalletBalance(await web3.eth.getBalance(address));

        } 
    }

    return (
        <div className='wallet'>
            <div className='header'>
                <h3>Wallet Component</h3>
                {
                    walletAddress ? (<button className='wallet-button' data-bs-toggle="modal" data-bs-target="#staticBackdrop2">{walletAddress}</button>) : (
                        <button className='button' data-bs-toggle="modal" data-bs-target="#staticBackdrop">Connect Wallet</button>
                    )
                }
            </div>
            <h4>Multiple wallets</h4>

            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Select Wallet</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className='wallets'>
                                <button className='positive ui button' data-bs-dismiss="modal" onClick={metamaskAccount}>Metamask Wallet</button>
                            </div>
                            <div className='wallets'>
                                <button className='positive ui button' data-bs-dismiss="modal" onClick={coinbaseAccount}>Coinbase Wallet</button>
                            </div>
                            <div className='wallets'>
                                <button className='positive ui button' data-bs-dismiss="modal" onClick={trustAccount}>Trust Wallet</button>
                            </div>
                            <div className='wallets'>
                                <button className='positive ui button' data-bs-dismiss="modal" onClick={connectWalletConnect}>Wallet Connect</button>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <div className='walletInfo'>
                <div className="modal fade" id="staticBackdrop2" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="staticBackdropLabel">Account</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <h4 className='wallet-head'>Address - <span className='wallet-address'>{walletAddress}</span></h4>
                                <h4 data-bs-dismiss="modal" className='disconnect' onClick={() => {
                                    setWalletAddress('');
                                    // setWalletBalance('');
                                }}>Disconnect</h4>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <h4>Wallet Address : {walletAddress}</h4>
            {/* <h4>Wallet Balance : {walletBalance} ETH</h4> */}
        </div>
    )
}

export default Wallet
