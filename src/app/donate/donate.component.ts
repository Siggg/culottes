import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require:any;
const contractABI = require('../../../build/contracts/Revolution.json');

@Component({
	selector: 'app-donate',
	templateUrl: './donate.component.html',
	styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {

	address: String = "default address from donate.component.ts";
	criteria: String = "default criteria from donate.component.ts"
	culottes: any;
	account: any;
	accounth: any;
	amount;
	isOk = false;
	web3_eth_contract: any;

	constructor(private web3Service: Web3Service, private route: ActivatedRoute,) {
	}

	async ngOnInit() {
	  this.address = this.web3Service.revolutionAddress;
		this.watchAccount();
		this.web3Service.artifactsToContract(contractABI)
			.then((web3_eth_contract) => {
				this.web3_eth_contract = web3_eth_contract;
				return web3_eth_contract.methods.criteria().call();
			})
			.then((criteria) => {
				console.log("criteria: ", criteria);
			});
	}

	onClickMe() {
		if (!this.amount)
			this.isOk=true;
		else {
			this.isOk=false;
			console.log(this.amount)
			this.web3_eth_contract.util.toWei(this.amount, 'ether');
			this.web3_eth_contract.sendTransaction({from: this.account, to: this.address, value: this.amount});
		}
	}
	
	async watchAccount() {
		this.web3Service.accountsObservable.subscribe((accounts) => {
			this.account = accounts[0];
		});
	}

}
