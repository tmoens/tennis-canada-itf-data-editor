import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentRaterComponent } from './tournament-rater.component';

describe('TournamentRaterComponent', () => {
  let component: TournamentRaterComponent;
  let fixture: ComponentFixture<TournamentRaterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentRaterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentRaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
