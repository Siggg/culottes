import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedtrialComponent } from './closed_trial.component';

describe('ClosedtrialComponent', () => {
  let component: ClosedtrialComponent;
  let fixture: ComponentFixture<ClosedtrialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosedtrialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosedtrialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
