import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAdmissionOfficeComponent } from './contact-admission-office.component';

describe('ContactAdmissionOfficeComponent', () => {
  let component: ContactAdmissionOfficeComponent;
  let fixture: ComponentFixture<ContactAdmissionOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactAdmissionOfficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactAdmissionOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
