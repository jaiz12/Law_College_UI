import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchAndPublicationsModalComponent } from './research-and-publications-modal.component';

describe('ResearchAndPublicationsModalComponent', () => {
  let component: ResearchAndPublicationsModalComponent;
  let fixture: ComponentFixture<ResearchAndPublicationsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchAndPublicationsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchAndPublicationsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
