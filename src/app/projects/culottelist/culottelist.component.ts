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
      .then((MetaCoinAbstraction) => {
		this.culottes = MetaCoinAbstraction;
		console.log("hey there");
        this.culottes.deployed().then(deployed => {
			console.log("hey there 2");
          console.log(deployed);
          deployed.Transfer({}, (err, ev) => {
            console.log('Transfer event came in, refreshing balance');
          });
        });

      });
}

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
