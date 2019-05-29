import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevolutionComponent } from './revolution.component';
import { OpentrialComponent } from "../trials/open_trial/open_trial.component";
import { ClosedtrialComponent } from "../trials/closed_trial/closed_trial.component";

import { Web3Service } from '../../util/web3.service';

describe('CulottelistComponent', () => {
  let component: RevolutionComponent;
  let fixture: ComponentFixture<RevolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
	declarations: [ RevolutionComponent, OpentrialComponent, ClosedtrialComponent ],
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
