import { Component, ViewChild, TemplateRef, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppService } from './_services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  title = 'angular-idle-timeout';

  public modalRef: BsModalRef;

  @ViewChild('childModal', { static: false }) childModal: ModalDirective;

  constructor(private idle: Idle, private keepalive: Keepalive, 
    private router: Router, private modalService: BsModalService, private appService: AppService) {
    
      // sets an idle timeout of 15 seconds, for testing purposes.
    idle.setIdle(15);
    
    // sets a timeout period of 300 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(300);
    
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => { 
      this.idleState = 'No longer idle.'
      console.log(this.idleState);
      this.reset();
    });
    
    idle.onTimeout.subscribe(() => {
      this.childModal.hide();
      this.idleState = 'Timed out!';
      this.timedOut = true;
      console.log(this.idleState);
      this.router.navigate(['/']);
    });
    
    idle.onIdleStart.subscribe(() => {
        this.idleState = 'You\'ve gone idle!'
        console.log(this.idleState);
        this.childModal.show();
    });
    
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = "You will be logged out in " + countdown + " seconds! Please choose \'Logout\' or \'Stay'\', or close this popup.";
      console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    keepalive.interval(15);

    keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.appService.getUserLoggedIn().subscribe(userLoggedIn => {
      if (userLoggedIn) {
        idle.watch()
        this.timedOut = false;
      } else {
        idle.stop();
      }
    })

    // on INIT go to Login screen
    this.router.navigate(['/']);

    // this.reset();
  }

  ngOnInit(): void {
    
  }

  reset() {
    this.idle.watch();
    //xthis.idleState = 'Started.';
    this.timedOut = false;
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  stay() {

    this.hideChildModal();
    // this.childModal.hide();
    // this.reset();

    // if (this.idleState == 'No longer idle.') {
    //   this.hideChildModal();
    //   this.childModal.ngOnDestroy();
    // } 
  }

  logout() {
    this.childModal.hide();
    this.appService.setUserLoggedIn(false);
    this.router.navigate(['/']);
  }

}
