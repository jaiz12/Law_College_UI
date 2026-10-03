import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotableAlumniModalComponent } from './notable-alumni-modal.component';

describe('NotableAlumniModalComponent', () => {
  let component: NotableAlumniModalComponent;
  let fixture: ComponentFixture<NotableAlumniModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotableAlumniModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotableAlumniModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
