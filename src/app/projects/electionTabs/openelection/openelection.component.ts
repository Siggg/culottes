import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../../../util/web3.service';

declare let require:any;
const culotteABI = require('../../../../../build/contracts/Culotte.json');

@Component({
  selector: 'app-openelection',
  templateUrl: './openelection.component.html',
  styleUrls: ['./openelection.component.css']
})
export class OpenelectionComponent implements OnInit {

    candidates: any;
    web3_eth_contract: any;

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {

    this.web3Service.artifactsToContract(culotteABI)
      .then((web3_eth_contract) => {
           this.web3_eth_contract = web3_eth_contract;
           return web3_eth_contract.getPastEvents("BallotOpened");
        })
      .then((ballotOpenings) => {
        console.log("openings: ", ballotOpenings);
        });

  }

}
