import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationalStructureModalComponent } from './organizational-structure-modal.component';

describe('OrganizationalStructureModalComponent', () => {
  let component: OrganizationalStructureModalComponent;
  let fixture: ComponentFixture<OrganizationalStructureModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationalStructureModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationalStructureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
