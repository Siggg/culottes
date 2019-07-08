import {Injectable} from '@angular/core';
import contract from 'truffle-contract';
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

  public accountsObservable = new Subject<string[]>();
  
  public web3Status = new BehaviorSubject<string>("no attempt to access your blockchain accounts yet, please wait or reload the app");

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
        let ethereum = window.ethereum;
        window.web3 = new Web3(ethereum);
        this.web3 = window.web3;
        this.web3Status.next("connecting to the blockchain");
     /*   try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            web3.eth.sendTransaction({ });
        } catch (error) {
            // User denied account access...
        }*/
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
      this.web3Status.next("Could not detect a blockchain-enabled browser. On desktop, you should install Metamask for Firefox or Chrome. On mobile, you should install Coinbase Wallet. Meanwhile trying to connect to a blockchain node on your machine with port 8545.");
    }

    setInterval(() => this.refreshAccounts(), 100);
    
  }

  

/*  public async artifactsToContract(artifacts, address?) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts, address);
    }

    console.log("hey me.");
    const contractAbstraction = contract({
		abi: artifacts,
		address: "0x4ae1e5b4FB7Ee9AcFE12dF24b966607c96104624"
	});
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;
  }*/

  public etherToWei(etherAmount) {
    return this.web3.utils.toWei(etherAmount);
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }
    const contractAbstraction = new this.web3.eth.Contract(artifacts.abi, '0xf26110452429f39eD677F111E65bf0c1825705A4');
    contractAbstraction.setProvider(this.web3.currentProvider);
    
    try {
      contractAbstraction.methods.criteria.call()
      .then( (result) => {
        this.web3Status.next("Bastille ready. Criteria is " + result);
      })
      .catch( (error) => {
        this.web3Status.next("This bastille can not be reached on the blokchain you are connected to. You should try switching your blockchain browser or node to Ropsten. The error message was: " + error.toString());
      });
    } catch (error) {
      this.web3Status.next("This bastille can not be reached on the blokchain you are connected to. You should try switching your blockchain browser or node to Ropsten. The error message was: " + error.toString());
    }
    
    return contractAbstraction;

  }

  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null && err != false) {
        console.warn('There was an error fetching your accounts.');
        this.web3Status.next("Connected to your blockchain browser or node but an error occurred while trying to access your accounts. Error message was ´´ " + err.toString() + " ´´ .");
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        this.web3Status.next("Connected to your blockchain browser or node but it could not find your accounts on the blockchain.");
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
        this.web3Status.next("Blockchain accounts ready");
      }

      this.ready = true;
    });
  }
}
