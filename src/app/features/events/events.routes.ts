import { Routes } from "@angular/router";
import { CreateEventPage } from "./create-event/create-event.page";
import { EventManagementPage } from "./event-management/event-management.page";

export const eventRoutes: Routes = [
  {
    path: 'events/create',
    component: CreateEventPage
  },
  {
    path: 'events/management',
    component: EventManagementPage
  }
];