import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../../util/web3.service';

declare let require:any;
const culotteABI = require('../../../../build/contracts/Culotte.json')

@Component({
  selector: 'app-culottelist',
  templateUrl: './culottelist.component.html',
  styleUrls: ['./culottelist.component.css']
})
export class CulottelistComponent implements OnInit {

	title: String = "Open Source Contributors"
	purpose: String = "Owners of addresses are frequent contributors to Open Source projects"
        cashierBalance: String = "0"
	culottes: any;
	account: any;

  constructor(private web3Service: Web3Service) {

  }

async ngOnInit() {
	console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.watchAccount();
    let web3_eth_contract = await this.web3Service.artifactsToContract(culotteABI);
    this.purpose = await web3_eth_contract.methods.criteria().call();
    this.cashierBalance = await web3_eth_contract.methods.cashierBalance().call();
}

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
