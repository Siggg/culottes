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
	culottes: any;
	account: any;

  constructor(private web3Service: Web3Service) {

  }

async ngOnInit() {
	console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.watchAccount();
    this.web3Service.artifactsToContract(culotteABI)
      .then((web3_eth_contract) => {
        return web3_eth_contract.methods.criteria().call();
        })
      .then((criteria) => {
        console.log("criteria: ", criteria);
        });
}

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
