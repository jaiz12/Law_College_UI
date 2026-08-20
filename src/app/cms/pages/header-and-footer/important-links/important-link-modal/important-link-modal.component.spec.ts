import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantLinkModalComponent } from './important-link-modal.component';

describe('ImportantLinkModalComponent', () => {
  let component: ImportantLinkModalComponent;
  let fixture: ComponentFixture<ImportantLinkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportantLinkModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportantLinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
