/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SourceModerationComponent } from './source-moderation.component';

describe('SourceModerationComponent', () => {
  let component: SourceModerationComponent;
  let fixture: ComponentFixture<SourceModerationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceModerationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
