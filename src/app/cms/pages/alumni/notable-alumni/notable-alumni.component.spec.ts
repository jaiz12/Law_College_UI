import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotableAlumniComponent } from './notable-alumni.component';

describe('NotableAlumniComponent', () => {
  let component: NotableAlumniComponent;
  let fixture: ComponentFixture<NotableAlumniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotableAlumniComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotableAlumniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
