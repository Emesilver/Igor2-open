import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderProvider } from 'src/app/services/order/order';
import { CustomerProvider } from 'src/app/services/customer/customer';
import { Router, NavigationStart } from '@angular/router';
import { EventsService } from 'src/app/services/events/events.service';

@Component({
  selector: 'toolbar-tools',
  templateUrl: './toolbar-tools.component.html',
  styleUrls: ['./toolbar-tools.component.scss'],
})
export class ToolbarToolsComponent implements OnInit, OnDestroy {

  draftsCount: string = null;
  constructor(
    private orderProvider: OrderProvider,
    private customerProvider: CustomerProvider,
    private router: Router,
    private events: EventsService,
  ) {
/*
    this.router.events.pipe(
          filter(event => event instanceof NavigationStart)
        ).subscribe((route: NavigationStart) => {
            if (route.url === '/home') {
              this.countDrafts();
            }
        });
*/
  }

  ngOnInit() {
    this.events.subscribe('countDrafts', () => {
      this.countDrafts()
    });
    this.countDrafts()
  }

  ngOnDestroy() {
    this.events.destroy('countDrafts')
  }

  async countDrafts() {
    let countAll = 0;
    const orders = await this.orderProvider.getAllOrderDraft();
    if (orders) {
      countAll += orders.length;
    }
    const customers = await this.customerProvider.getAllDraftLocal();
    if (customers) {
      countAll += customers.length;
    }

    if (countAll > 9) {
      this.draftsCount = '9+';
    } else if (countAll > 0) {
      this.draftsCount = countAll.toString();
    } else {
      this.draftsCount = countAll.toString();
    }
  }

  goToDraftListPage() {
    this.router.navigate(['/drafts-list']);
  }

  goToChatPage() {
    this.router.navigate(['/chat']);
  }

}
