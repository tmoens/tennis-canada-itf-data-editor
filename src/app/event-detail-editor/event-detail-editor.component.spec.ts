import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailEditorComponent } from './event-detail-editor.component';

describe('EventDetailEditorComponent', () => {
  let component: EventDetailEditorComponent;
  let fixture: ComponentFixture<EventDetailEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventDetailEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
