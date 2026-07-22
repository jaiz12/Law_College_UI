import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrganizationalStructureComponent } from './view-organizational-structure.component';

describe('ViewOrganizationalStructureComponent', () => {
  let component: ViewOrganizationalStructureComponent;
  let fixture: ComponentFixture<ViewOrganizationalStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrganizationalStructureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrganizationalStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
