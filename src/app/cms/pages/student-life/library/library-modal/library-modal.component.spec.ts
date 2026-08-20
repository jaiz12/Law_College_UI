import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryModalComponent } from './library-modal.component';

describe('LibraryModalComponent', () => {
  let component: LibraryModalComponent;
  let fixture: ComponentFixture<LibraryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
