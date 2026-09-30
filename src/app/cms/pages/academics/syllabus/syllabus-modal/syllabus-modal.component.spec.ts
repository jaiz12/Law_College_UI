import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyllabusModalComponent } from './syllabus-modal.component';

describe('SyllabusModalComponent', () => {
  let component: SyllabusModalComponent;
  let fixture: ComponentFixture<SyllabusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyllabusModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyllabusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
