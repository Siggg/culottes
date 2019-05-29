import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../util/web3.service';

declare let require:any;
const contractABI = require('../../../build/contracts/Revolution.json')

@Component({
  selector: 'app-revolution',
  templateUrl: './revolution.component.html',
  styleUrls: ['./revolution.component.css']
})
export class RevolutionComponent implements OnInit {

	title: String = "Your revolution"
	criteria: String = "default criteria from revolution.component.ts"
    bastilleBalance: String = "1"
	culottes: any;
	account: any;

  constructor(private web3Service: Web3Service) {

  }

async ngOnInit() {
	console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.watchAccount();
    let web3_eth_contract = await this.web3Service.artifactsToContract(contractABI);
	this.criteria = await web3_eth_contract.methods.criteria().call();
    this.bastilleBalance = await web3_eth_contract.methods.bastilleBalance().call();
}

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
