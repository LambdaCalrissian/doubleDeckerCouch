import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteContentComponent } from './route-content.component';

describe('RouteContentComponent', () => {
  let component: RouteContentComponent;
  let fixture: ComponentFixture<RouteContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
