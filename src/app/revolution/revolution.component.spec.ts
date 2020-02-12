import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevolutionComponent } from './revolution.component';

import { Web3Service } from '../util/web3.service';

import { RouterTestingModule } from '@angular/router/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ClipboardModule } from 'ngx-clipboard';

describe('RevolutionComponent', () => {
  let component: RevolutionComponent;
  let fixture: ComponentFixture<RevolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ClipboardModule,
        HttpClientTestingModule ],
      declarations: [
        RevolutionComponent ],
      providers: [ Web3Service ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
