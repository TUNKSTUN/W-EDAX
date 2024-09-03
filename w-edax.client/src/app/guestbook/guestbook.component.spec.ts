import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestbookComponent } from './guestbook.component';

describe('GuestbookComponent', () => {
  let component: GuestbookComponent;
  let fixture: ComponentFixture<GuestbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestbookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
