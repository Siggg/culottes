import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpentrialComponent } from './open_trial.component';

describe('OpentrialComponent', () => {
  let component: OpentrialComponent;
  let fixture: ComponentFixture<OpentrialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpentrialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpentrialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
