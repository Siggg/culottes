import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require:any;
const culotteABI = require('../../../build/contracts/Culotte.json');

@Component({
  selector: 'app-id',
  templateUrl: './id.component.html',
  styleUrls: ['./id.component.css']
})
export class IdComponent implements OnInit {

	address: String = "0x";
	purpose: String = "A frequent contributor to Open Source Projects"
	culottes: any;
	account: any;
	accounth: any;
	amount;
	isOk = false;
	web3_eth_contract: any;

  constructor(private web3Service: Web3Service, private route: ActivatedRoute,) {
  }

async ngOnInit() {
	this.getAddress();
	this.watchAccount();
    this.web3Service.artifactsToContract(culotteABI)
      .then((web3_eth_contract) => {
		  	this.web3_eth_contract = web3_eth_contract;
			return web3_eth_contract.methods.criteria().call();
        })
      .then((criteria) => {
        console.log("criteria: ", criteria);
        });
}


onClickMeT() {
	if (!this.amount)
		this.isOk=true;
	else {
		this.isOk=false;
		this.amount = this.amount * 100000000000000;
		console.log(this.amount);
		this.web3_eth_contract.methods.vote(true, this.address)
		.send({from: this.account, value: this.amount});
	}
}

onClickMeF() {
	if (!this.amount)
		this.isOk=true;
		else {
			this.isOk=false;
		
			console.log(this.account + "vote amount F:" + this.amount * 10000000000000000000)
			this.web3_eth_contract.methods.vote(false, this.address)
			.send({from: this.account,  value: this.web3_eth_contract.utils.toWei(this.amount, 'ether')})
		}
}


getAddress(): void {
	this.address = this.route.snapshot.paramMap.get('address');
  }

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
