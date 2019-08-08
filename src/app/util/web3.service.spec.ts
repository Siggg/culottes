import {TestBed, inject} from '@angular/core/testing';
const Web3 = require('web3');

import {Web3Service} from './web3.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import revolution_artifacts from '../../../build/contracts/Revolution.json';

declare let window: any;

describe('Web3Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Web3Service],
      imports: [
        HttpClientTestingModule,
      ],
    });
  });

  it('should be created', inject([Web3Service], (service: Web3Service) => {
    expect(service).toBeTruthy();
  }));

  it('should inject a default web3 on a contract', inject([Web3Service], (service: Web3Service) => {
    service.bootstrapWeb3();

    return service.artifactsToContract(revolution_artifacts).then((abstraction) => {
      expect(abstraction.currentProvider.host).toBe('http://localhost:8545');
    });
  }));

  it('should inject a the window web3 on a contract', inject([Web3Service], (service: Web3Service) => {
    window.web3 = {
      currentProvider: new Web3.providers.HttpProvider('http://localhost:1337')
    };

    service.bootstrapWeb3();

    return service.artifactsToContract(revolution_artifacts).then((abstraction) => {
      expect(abstraction.currentProvider.host).toBe('http://localhost:1337');
    });
  }));
});
