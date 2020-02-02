import {Injectable} from '@angular/core';
import contract from 'truffle-contract';
import { HttpClient } from '@angular/common/http';
import {Subject} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

declare let require: any;
const Web3 = require('web3');
declare let window: any;

const networks = {
 "1": "Main",
 "2": "Morden",
 "3": "Ropsten",
 "4": "Rinkeby",
 "42": "Kovan"
};

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  public revolutions = {
    "0xb3aC6256C0DCAAF45b1E7c60993Ed5EDee10e1fa": "#Top3Contributors", // @mainnet with #Top3Contributors, 5760, 0.1 ETH, false
    "0xEcBA11d40bF907DE0E7e937e83898E8Af5cfC9cb": "#UniversalBasicIncome" // @mainnet with #UniversalBasicIncome, 175680, 0.5 ETH, false
  };
	// "0xbF30326B8D8979026e6432B4B2bC54B3F8993C7d" @mainnet with #UniversalBasicIncome, 175680, 0.5 ETH, true
	// "0xf3122a43EE86214e04B255bA78c980C43d0073E2" @mainnet with #Top3Contributors, 5760, 0.1 ETH, true but lottery was wrong
	// "0x6DcdCE5853cfbCBE4E3eB15c9AB2277983387CD9" @mainnet with 5760, 0.1 ETH, true, true but trials could be closed anytime by anyone
        // "0x087FA96fCF4bb4BF0A52F367b5Bae915F467371f" @rinkeby with 5760, 0.1 ETH, true, true
        // "0x73d69485462862b1d4F0674611D5d6A43DD424e4" @rinkeby with 6200, 0.025 ETH, true, true
	// "0x3a1C54c0414D1E162837Eda4C69c6d587A83b3d3" @rinkeby with 6200, 0.025 ETH, true, true but trials could close at any new block
	// "0x3029ba9190cF587c399451aD09fBa2344fd72290" @rinkeby with 4, 0.000625 ETH, true, true
	// "0xB0573E469b5a1b811Ea43B6fc414686716c1FEe6" @rinkeby with 3 142 true true but vote would not re-open trials
	// "0xba074e774A614a167F88c161125eb515cDe824F0" @rinkeby with 3 1337 false false
	// "0x9FB6C2d5556C31fCb6c35e88e99b0db3761ec053" @rinkeby with 3 7 false false but citizens was private
	// "0xf26110452429f39eD677F111E65bf0c1825705A4" @rinkeby with 3 7 false false but bastilleBalance was called balance
	// see contracts/Revolution.sol or migrations/2_... for the meaning of parameters
  public revolutionAddress: string = Object.keys(this.revolutions)[0];
  public revolutionBlockchain: string = 'Mainnet';
  // Connected to a web3 API ?
  public statusWeb3 = false;
  // Connected to the proper blockchain ?
  public statusNetwork = false;
  // With an account ?
  public statusAccount = false;
  // Blockchain interactions authorized by user ?
  public statusAuthorized = false;
  // Dapp communication seems to be OK ?
  public statusError = true;
	
  public accountsObservable = new Subject<string[]>();
  
  public web3Status = new BehaviorSubject<string>("no attempt to access your blockchain accounts yet, please wait or reload the app");
  
  private priceOfCurrenciesUrl = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=AUD,CAD,CNY,EUR,GBP,JPY,USD&extraParams=culottes';
  
  public currency: String = "EUR";
  
  public priceOfCurrencies = {};

  public updatePriceOfCurrencies(): void {
    this
      .http
      .get(
        this.priceOfCurrenciesUrl,
        { observe: 'response' })
      .subscribe((response) => {
        this.priceOfCurrencies = response.body;
      });
  }
  
  public convertToFiat(amount) {
    try {
      let priceOfCurrency = this.priceOfCurrencies[this.currency.toString()];
      let result: any = (+amount * +priceOfCurrency).toFixed(2);
      if (isNaN(result)) {
        result = 0;
      }
      return result;
    } catch (error) {
      return 0;
    }
  }
  
  constructor(private http: HttpClient) {
    window.addEventListener('load', async () => {
      this.bootstrapWeb3();
    });
    this.updatePriceOfCurrencies();
    this.bootstrapWeb3();
  }

  public bootstrapWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
        let ethereum = window.ethereum;
        window.web3 = new Web3(ethereum);
        this.web3 = window.web3;
        this.web3Status.next("connecting to the blockchain");
        this.statusWeb3 = true;
    }
    // Legacy dapp browsers...
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    else if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
	    this.web3 = new Web3(window.web3.currentProvider);
	    this.web3Status.next("connecting to the blockchain via Metamask or Mist");
	    this.statusWeb3 = true;
    }
    else {
      console.log('No web3? You should consider trying MetaMask!');
      
      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3
        .providers
        .HttpProvider
        .prototype
        .sendAsync = Web3
          .providers
          .HttpProvider
          .prototype
          .send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      this.web3Status.next('Could not detect a blockchain-enabled browser (also called web3 browser, dapp browser or dapp wallet) connected to the ' + this.revolutionBlockchain + ' Ethereum blockchain.<br />On desktop, you should install <a href="http://metamask.io">Metamask for Firefox or for Chrome</a>. On mobile, you should install one of these wallet apps : <a href="https://www.trustwallet.com/">Truet Wallet</a>,  <a href="http://metamask.io">Metamask</a>, <a href="https://dev.status.im/get/">Status IM</a> or <a href="https://wallet.coinbase.com/">Coinbase Wallet</a>. And switch it to ' + this.revolutionBlockchain + '. You might ignore this message if your machine is running a blockchain node on port 8545.');
      this.statusError = true;
    }
    this.checkNetwork();
    setInterval(() => this.refreshAccounts(), 100);
    
  }
  
  public checkNetwork() {
    this
      .web3
      .eth
      .net
      .getId((id) => {
        let networkName = networks[id];
        if (networkName != undefined) {
          networkName = networkName.toLowerCase();
        } else {
          networkName = "unknown";
        }
        if (this
          .revolutionBlockchain
          .toLowerCase()
          != networkName) {
          this.statusNetwork = false;
          this.statusError = true;
          this.web3Status.next("Your web3 browser is not connected to the proper Ethereum blockchain. It's connected to the " + networkName + " blockchain whereas the Culottes revolution you are trying to reach is on the " + this.revolutionBlockchain + " blockchain. Please adjust its settings then reload this page.");
        } else {
          this.statusNetwork = true;
        }
      });
  }

  public etherToWei(etherAmount) {
    return this
      .web3
      .utils
      .toWei(etherAmount.toString());
  }

  public weiToEther(weiAmount) {
    return this
      .web3
      .utils
      .fromWei(weiAmount.toString());
  }
  
  public async sendTransaction(tx) {
    if (window.ethereum) {
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        this.web3.eth.sendTransaction(tx);
        this.statusAuthorized = true;
      } catch (error) {
        this.web3Status.next('User denied account access...');
        this.statusError = true;
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // Acccounts always exposed
      this.web3.eth.sendTransaction(tx);
      this.statusAuthorized = true;
    }
    // Non-dapp browsers...
    else {
      this.web3Status.next('Could not detect a blockchain-enabled browser (so called web3 browser, dapp browser or dapp wallet) connected to the ' + this.revolutionBlockchain + ' Ethereum blockchain. On desktop, you should install <a href="http://metamask.io">Metamask for Firefox or for Chrome</a>. On mobile, you should install one of these wallet apps : <a href="https://www.trustwallet.com/">Trust Wallet</a>,  <a href="http://metamask.io">Metamask</a>, <a href="https://dev.status.im/get/">Status IM</a> or <a href="https://wallet.coinbase.com/">Coinbase Wallet</a>. And switch it to ' + this.revolutionBlockchain + ' . Meanwhile trying to connect to a blockchain node on your machine with port 8545.');
      this.statusWeb3 = false;
      this.statusError = true;
    }
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }
    const contractAbstraction = new this
      .web3
      .eth
      .Contract(artifacts.abi, this.revolutionAddress);
    contractAbstraction
      .setProvider(this.web3.currentProvider);
    
    try {
      contractAbstraction
        .methods
        .criteria
        .call()
      .then( (result) => {
        if (result === null) {
          this.web3Status.next("This revolution can not be reached on the blokchain you are connected to. You should switch your blockchain browser or node to the Ethereum " + this.revolutionBlockchain + " blockchain.");
          this.statusError = true;
        } else {
          this.statusNetwork = true;
          this.statusError = false;
          this.web3Status.next("Revolution ready.");
        }
      })
      .catch( (error) => {
        this.web3Status.next("This revolution can not be reached on the blokchain you are connected to. You should try switching your blockchain browser or node to the Ethereum ' + this.revolutionBlockchain + ' blockchain. The error message was: " + error.toString());
        this.statusError = true;
      });
    } catch (error) {
      this.web3Status.next("This revolution can not be reached on the blokchain you are connected to. You should try switching your blockchain browser or node to the Ethereum ' + this.revolutionBlockchain + '  blockchain. The error message was: " + error.toString());
      this.statusError = true;
    }
    
    return contractAbstraction;

  }

  public refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      // console.log('Refreshing accounts');
      if (err != null && err != false) {
        console.warn('There was an error fetching your accounts.');
        this.web3Status.next("Connected to your blockchain browser or node but an error occurred while trying to access your accounts on the blockchain. Error message was ´´ " + err.toString() + err.message + " ´´ .");
        this.statusError = true;
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        //console.warn('Couldn\'t get any account! Make sure your Ethereum client is configured correctly.');
        // console.log('err: ', err);
        // console.log('accs: ', accs);
        this.web3Status.next("Connected to your blockchain browser or node but it could not find your accounts on the blockchain.");
        // this.statusError = true;
        return;
      }

      if (!this.accounts ||
        this.accounts.length !== accs.length ||
        this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');
        this
          .accountsObservable
          .next(accs);
        this.accounts = accs;
        // this.web3Status.next("Blockchain accounts ready.");
        this.statusAccount = true;
      }

    });
  }
  
  public dappStatus() {
    return {
      statusWeb3: this.statusWeb3,
	    statusNetwork: this.statusNetwork,
	    statusAccount: this.statusAccount,
	    statusAuthorized: this.statusAuthorized,
	    statusError: this.statusError
    };
  }
}
