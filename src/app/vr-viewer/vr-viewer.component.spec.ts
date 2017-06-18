import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VrViewerComponent } from './vr-viewer.component';

describe('VrViewerComponent', () => {
  let component: VrViewerComponent;
  let fixture: ComponentFixture<VrViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VrViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VrViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
