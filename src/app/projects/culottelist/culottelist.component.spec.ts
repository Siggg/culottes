import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CulottelistComponent } from './culottelist.component';
import { OpentrialComponent } from "../../projects/trials/open_trial/open_trial.component";
import { ClosedtrialComponent } from "../../projects/trials/closed_trial/closed_trial.component";

import { Web3Service } from '../../util/web3.service';

describe('CulottelistComponent', () => {
  let component: CulottelistComponent;
  let fixture: ComponentFixture<CulottelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
	declarations: [ CulottelistComponent, OpentrialComponent, ClosedtrialComponent ],
	providers: [ Web3Service ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CulottelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
