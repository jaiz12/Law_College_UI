import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramAndCurriculumComponent } from './program-and-curriculum.component';

describe('ProgramAndCurriculumComponent', () => {
  let component: ProgramAndCurriculumComponent;
  let fixture: ComponentFixture<ProgramAndCurriculumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramAndCurriculumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramAndCurriculumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
