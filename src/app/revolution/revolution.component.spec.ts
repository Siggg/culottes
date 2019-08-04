import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevolutionComponent } from './revolution.component';
import { OpentrialComponent } from "../open_trial/open_trial.component";
import { ClosedtrialComponent } from "../closed_trial/closed_trial.component";

import { Web3Service } from '../util/web3.service';

import { RouterTestingModule } from '@angular/router/testing';

describe('CulottelistComponent', () => {
  let component: RevolutionComponent;
  let fixture: ComponentFixture<RevolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
	    declarations: [
	      RevolutionComponent,
	      OpentrialComponent,
	      ClosedtrialComponent ],
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
