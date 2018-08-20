import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItfPlayerListComponent } from './external-player-manager.component';

describe('ItfPlayerListComponent', () => {
  let component: ItfPlayerListComponent;
  let fixture: ComponentFixture<ItfPlayerListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItfPlayerListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItfPlayerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
