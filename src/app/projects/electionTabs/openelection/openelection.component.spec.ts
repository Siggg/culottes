import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenelectionComponent } from './openelection.component';

describe('OpenelectionComponent', () => {
  let component: OpenelectionComponent;
  let fixture: ComponentFixture<OpenelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
