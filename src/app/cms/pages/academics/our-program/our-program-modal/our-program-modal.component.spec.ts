import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurProgramModalComponent } from './our-program-modal.component';

describe('OurProgramModalComponent', () => {
  let component: OurProgramModalComponent;
  let fixture: ComponentFixture<OurProgramModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurProgramModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurProgramModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
