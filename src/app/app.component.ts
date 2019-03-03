import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ServerService } from './core/services/server/server.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BackService } from './core/services/back.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'deploy-webui';
  constructor(
      private router: Router,
      private location: Location,
      public backService: BackService
  ) {}

  goTo(link: string) {
    this.backService.hideArrow();
    this.router.navigate([link]);
  }

  back() {
    this.location.back();
    this.backService.hideArrow();
  }

}
