import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalsMessageComponent } from './principals-message.component';

describe('PrincipalsMessageComponent', () => {
  let component: PrincipalsMessageComponent;
  let fixture: ComponentFixture<PrincipalsMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalsMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalsMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
