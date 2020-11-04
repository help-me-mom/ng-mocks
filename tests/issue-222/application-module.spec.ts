import { ApplicationRef, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { MockBuilder } from 'ng-mocks';

@NgModule({
  imports: [BrowserModule],
})
class TargetModule {}

describe('issue-222:application-module', () => {
  beforeEach(() => MockBuilder(null, TargetModule));

  it('does not mock its guts', () => {
    const service = TestBed.get(ApplicationRef);
    expect(service.viewCount).toBeDefined();
  });
});
