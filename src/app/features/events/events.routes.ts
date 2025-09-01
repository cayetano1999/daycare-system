import { Routes } from "@angular/router";
import { CreateEventPage } from "./create-event/create-event.page";

export const eventRoutes: Routes = [
  {
    path: 'events/create',
    component: CreateEventPage
  },
//   {
//     path: ':id',
//     component: EventDetailPage
//   }
];