import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require:any;
const contractABI = require('../../../build/contracts/Revolution.json');

@Component({
	selector: 'app-id',
	templateUrl: './id.component.html',
	styleUrls: ['./id.component.css']
})
export class IdComponent implements OnInit {

	address: String = "0x";
	criteria: String = "A frequent contributor to Open Source Projects"
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
		this.web3Service.artifactsToContract(contractABI)
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
