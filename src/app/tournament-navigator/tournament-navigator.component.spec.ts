import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentNavigatorComponent } from './tournament-navigator.component';

describe('TournamentNavigatorComponent', () => {
  let component: TournamentNavigatorComponent;
  let fixture: ComponentFixture<TournamentNavigatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentNavigatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
