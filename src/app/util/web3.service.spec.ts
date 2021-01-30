import {TestBed, inject} from '@angular/core/testing';
import { ethers } from "ethers";

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

  /* it('should inject a blockchain access provider on a contract', inject([Web3Service], (service: Web3Service) => {
    window.ethereum = {
      currentProvider: new ethers.providers.JsonRpcProvider('http://localhost:1337')
    };

    service.bootstrapWeb3();
    let address = undefined;
    return service.artifactsToContract(revolution_artifacts, address).then((abstraction) => {
      expect(abstraction.provider.host).toBe('http://localhost:1337');
    });
  })); */
});
