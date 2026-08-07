import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFacultiesComponent } from './view-faculties.component';

describe('ViewFacultiesComponent', () => {
  let component: ViewFacultiesComponent;
  let fixture: ComponentFixture<ViewFacultiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFacultiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFacultiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
