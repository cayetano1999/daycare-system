import { addIcons } from 'ionicons';
import {
  add,
  addCircle,
  alertCircle,
  arrowBack,
  calendar,
  call,
  checkmarkCircle,
  chevronForward,
  close,
  closeCircle,
  document,
  documentText,
  download,
  ellipsisVertical,
  eye,
  fitness,
  image,
  informationCircle,
  medical,
  people,
  person,
  school,
  search,
  shieldCheckmark,
  statsChart
} from 'ionicons/icons';

// export function registerIonIcons() {
//   addIcons({
//     add,
//     'add-circle': addCircle,
//     'alert-circle': alertCircle,
//     'arrow-back': arrowBack,
//     calendar,
//     call,
//     'checkmark-circle': checkmarkCircle,
//     'chevron-forward': chevronForward,
//     close,
//     'close-circle': closeCircle,
//     document,
//     'document-text': documentText,
//     download,
//     'ellipsis-vertical': ellipsisVertical,
//     eye,
//     fitness,
//     image,
//     'information-circle': informationCircle,
//     medical,
//     people,
//     person,
//     school,
//     search,
//     'shield-checkmark': shieldCheckmark,
//     'stats-chart': statsChart
//   });
// }
import * as icons from 'ionicons/icons';

export function registerIonIcons() {
  const iconMap: Record<string, string> = {};

  Object.entries(icons).forEach(([key, value]) => {
    const kebabName = key
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

    iconMap[kebabName] = value as string;
  });

  addIcons(iconMap);
}
