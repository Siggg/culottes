import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CulottelistComponent } from './culottelist.component';

describe('CulottelistComponent', () => {
  let component: CulottelistComponent;
  let fixture: ComponentFixture<CulottelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CulottelistComponent ]
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
