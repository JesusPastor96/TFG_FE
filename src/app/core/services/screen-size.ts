import { MediaMatcher } from '@angular/cdk/layout';
import { Injectable, Signal, signal } from '@angular/core';
// MediaMatcher se encarga de hacer Responsive la web.
@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  private mobileQuery: MediaQueryList;
  private readonly _isMobile = signal(false);


  constructor(private mediaMatcher: MediaMatcher) {
    this.mobileQuery = mediaMatcher.matchMedia('(max-width: 600px)');

    this._isMobile.set(this.mobileQuery.matches);

    this.mobileQuery.addEventListener('change', (e) => {
      this._isMobile.set(e.matches);
    });
  }

  get isMobile(): Signal<boolean> {
    return this._isMobile;
  }
}
