import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require:any;
const culotteABI = require('../../../build/contracts/Culotte.json');

@Component({
  selector: 'app-new-candidate',
  templateUrl: './new-candidate.component.html',
  styleUrls: ['./new-candidate.component.css']
})
export class NewCandidateComponent implements OnInit {

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
		const weiAmount = this.web3Service.etherToWei(this.amount);
		console.log(weiAmount)
		this.web3_eth_contract.methods.vote(true, this.address).send({from: this.account, value: weiAmount})
	}
}

onClickMeF() {
	if (!this.amount)
		this.isOk=true;
		else {
			this.isOk=false;
			const weiAmount = this.web3Service.etherToWei(this.amount);
			console.log(weiAmount)
			this.web3_eth_contract.methods.vote(false, this.address).send({from: this.account, value: weiAmount})
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
