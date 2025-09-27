import { Routes } from "@angular/router";
import { CreateEventPage } from "./create-event/create-event.page";
import { EventManagementPage } from "./event-management/event-management.page";
import { EventExpensesPage } from "./event-expenses/event-expenses.page";
import { GiftListPage } from "./event-gift-list/event-gift-list.page";
import { GroupsPage } from "./groups/groups.page";
import { EventMembersPage } from "./event-members/event-members.page";
import { EventTablesPage } from "./event-tables/event-tables.page";
import { EventGuestsPage } from "./event-guests/event-guests.page";
import { EventTicketsPage } from "./event-ticket/event-ticket.page";
import { EventScannerPage } from "./event-scanner/event-scanner.page";
import { GuestVerificationPage } from "./guest-verification/guest-verification.page";
import { MessagesPage } from "./messages/messages.page";

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
  },
  {
    path: 'events/members',
    component: EventMembersPage
  },
  {
    path: 'events/tables',
    component: EventTablesPage
  },
  {
    path: 'events/guests',
    component: EventGuestsPage
  },
  {
    path: 'events/tickets',
    component: EventTicketsPage
  },

  {
    path: 'events/scanner',
    component: EventScannerPage
  },
  {
    path: 'events/guest-verification/:guest_id/:event_id',
    component: GuestVerificationPage
  },
  {
    path: 'events/messages',
    component: MessagesPage
  }


];