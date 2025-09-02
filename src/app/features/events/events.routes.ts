import { Routes } from "@angular/router";
import { CreateEventPage } from "./create-event/create-event.page";
import { EventManagementPage } from "./event-management/event-management.page";
import { EventExpensesPage } from "./event-expenses/event-expenses.page";
import { GiftListPage } from "./event-gift-list/event-gift-list.page";
import { GroupsPage } from "./groups/groups.page";

export const eventRoutes: Routes = [
  {
    path: 'events/create',
    component: CreateEventPage
  },
  {
    path: 'events/management',
    component: EventManagementPage
  },
  {
    path: 'events/expenses',
    component: EventExpensesPage
  },
  {
    path: 'events/gift-list',
    component: GiftListPage,
  },

  {
    path: 'events/groups',
    component: GroupsPage
  }

];