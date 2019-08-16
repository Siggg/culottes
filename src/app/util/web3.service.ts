import {Injectable} from '@angular/core';
import contract from 'truffle-contract';
import { HttpClient } from '@angular/common/http';
import {Subject} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

declare let require: any;
const Web3 = require('web3');

declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  public ready = false;
  public revolutionAddress = "0x3029ba9190cF587c399451aD09fBa2344fd72290"; // @rinkeby with 4, 0.000625 ETH, true, true
	// "0xB0573E469b5a1b811Ea43B6fc414686716c1FEe6"; // @rinkeby with 3 142 true true but vote would not re-open trials
	// "0xba074e774A614a167F88c161125eb515cDe824F0" @rinkeby with 3 1337 false false
	// "0x9FB6C2d5556C31fCb6c35e88e99b0db3761ec053" @rinkeby with 3 7 false false but citizens was private
	// "0xf26110452429f39eD677F111E65bf0c1825705A4" @rinkeby with 3 7 false false but bastilleBalance was called balance
	// see contracts/Revolution.sol or migrations/2_... for the meaning of parameters

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
    }
    // Legacy dapp browsers...
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    else if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
	  this.web3 = new Web3(window.web3.currentProvider);
	  this.web3Status.next("connecting to the blockchain via Metamask or Mist");

    }
    else {
      console.log('No web3? You should consider trying MetaMask!');
      
      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      this.web3Status.next('Could not detect a blockchain-enabled browser (web3 browser) connected to the Rinkeby Ethereum network. On desktop, you should install <a href="http://metamask.io">Metamask for Firefox or for Chrome</a>. On mobile, you should install one of these wallet apps : <a href="https://www.cipherbrowser.com/">Cipher</a>,  <a href="http://metamask.io">Metamask</a>, <a href="https://dev.status.im/get/">Status IM</a> or <a href="https://wallet.coinbase.com/">Coinbase Wallet</a>. And switch it to Rinkeby. Meanwhile trying to connect to a blockchain node on your machine with port 8545.');
    }
    setInterval(() => this.refreshAccounts(), 100);
    
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
        } catch (error) {
            this.web3Status.next('User denied account access...');
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        // Acccounts always exposed
        this.web3.eth.sendTransaction(tx);
    }
    // Non-dapp browsers...
    else {
        this.web3Status.next('Could not detect a blockchain-enabled browser (web3 browser) connected to the Rinkeby Ethereum network. On desktop, you should install <a href="http://metamask.io">Metamask for Firefox or for Chrome</a>. On mobile, you should install one of these wallet apps : <a href="https://www.cipherbrowser.com/">Cipher</a>,  <a href="http://metamask.io">Metamask</a>, <a href="https://dev.status.im/get/">Status IM</a> or <a href="https://wallet.coinbase.com/">Coinbase Wallet</a>. And switch it to Rinkeby. Meanwhile trying to connect to a blockchain node on your machine with port 8545.');
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
          this.web3Status.next("This bastille can not be reached on the blokchain you are connected to. You should try switching your blockchain browser or node to the Ethereum Rinkeby blockchain.");
        } else {
          this.web3Status.next("Bastille ready.");
        }
      })
      .catch( (error) => {
        this.web3Status.next("This bastille can not be reached on the blokchain you are connected to. You should try switching your blockchain browser or node to the Ethereum Rinkeby blockchain. The error message was: " + error.toString());
      });
    } catch (error) {
      this.web3Status.next("This bastille can not be reached on the blokchain you are connected to. You should try switching your blockchain browser or node to the Ethereum Rinkeby blockchain. The error message was: " + error.toString());
    }
    
    return contractAbstraction;

  }

  public refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      // console.log('Refreshing accounts');
      if (err != null && err != false) {
        console.warn('There was an error fetching your accounts.');
        this.web3Status.next("Connected to your blockchain browser or node but an error occurred while trying to access your accounts on the blockchain. Error message was ´´ " + err.toString() + err.message + " ´´ .");
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        // console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        this.web3Status.next("Connected to your blockchain browser or node but it could not find your accounts on the blockchain.");
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
        this.web3Status.next("Blockchain accounts ready.");
      }

      this.ready = true;
    });
  }
}
