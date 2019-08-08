import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms'; 
import { Web3Service } from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

import { DonateComponent } from './donate.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DonateComponent', () => {
  let component: DonateComponent;
  let fixture: ComponentFixture<DonateComponent>;

	const fakeActivatedRoute = {
		snapshot: { data: {} }
	} as ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
	imports: [ FormsModule, HttpClientTestingModule ],
	declarations: [ DonateComponent ],
	providers: [ Web3Service,
		{ provide: ActivatedRoute, useValue: fakeActivatedRoute } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
