import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentDetailEditorComponent } from './tournament-detail-editor.component';

describe('TournamentDetailEditorComponent', () => {
  let component: TournamentDetailEditorComponent;
  let fixture: ComponentFixture<TournamentDetailEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentDetailEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentDetailEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
