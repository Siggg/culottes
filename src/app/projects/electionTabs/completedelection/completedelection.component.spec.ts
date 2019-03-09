import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedelectionComponent } from './completedelection.component';

describe('CompletedelectionComponent', () => {
  let component: CompletedelectionComponent;
  let fixture: ComponentFixture<CompletedelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletedelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
