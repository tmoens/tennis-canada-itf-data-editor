import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventResultEditorComponent } from './event-result-editor.component';

describe('EventResultEditorComponent', () => {
  let component: EventResultEditorComponent;
  let fixture: ComponentFixture<EventResultEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventResultEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventResultEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
