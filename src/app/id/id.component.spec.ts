import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms'; 
import { Web3Service } from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

import { IdComponent } from './id.component';

describe('IdComponent', () => {
  let component: IdComponent;
  let fixture: ComponentFixture<IdComponent>;

        const fakeActivatedRoute = {
                snapshot: { data: {} }
        } as ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdComponent ],
      imports: [ FormsModule ],
      providers: [ Web3Service,
                { provide: ActivatedRoute, useValue: fakeActivatedRoute } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
