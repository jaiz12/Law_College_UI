import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchAndPublicationsComponent } from './research-and-publications.component';

describe('ResearchAndPublicationsComponent', () => {
  let component: ResearchAndPublicationsComponent;
  let fixture: ComponentFixture<ResearchAndPublicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchAndPublicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchAndPublicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
