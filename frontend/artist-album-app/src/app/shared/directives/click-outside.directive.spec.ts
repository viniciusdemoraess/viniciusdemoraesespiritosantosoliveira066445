import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  template: `
    <div class="container">
      <div class="dropdown" (clickOutside)="onClickOutside()">
        Dropdown content
      </div>
    </div>
  `
})
class TestComponent {
  clickedOutside = false;

  onClickOutside(): void {
    this.clickedOutside = true;
  }
}

describe('ClickOutsideDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let dropdownElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ClickOutsideDirective]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    dropdownElement = fixture.debugElement.query(By.css('.dropdown'));
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(dropdownElement).toBeTruthy();
  });

  it('should emit clickOutside when clicking outside the element', () => {
    const containerElement = fixture.debugElement.query(By.css('.container'));
    
    // Click on container (outside dropdown)
    containerElement.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(true);
  });

  it('should not emit clickOutside when clicking inside the element', () => {
    // Click on dropdown (inside)
    dropdownElement.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(false);
  });

  it('should not emit clickOutside when clicking on document initially', () => {
    expect(component.clickedOutside).toBe(false);
  });
});
