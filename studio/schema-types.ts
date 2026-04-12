// documents
import page from "./schemas/documents/page";
import faq from "./schemas/documents/faq";
import navigation from "./schemas/documents/navigation";
import settings from "./schemas/documents/settings";
import storyChapter from "./schemas/documents/storyChapter";
import entourageMember from "./schemas/documents/entourageMember";
import guest from "./schemas/documents/guest";
import announcement from "./schemas/documents/announcement";

// Schema UI shared objects
import blockContent from "./schemas/blocks/shared/block-content";
import link from "./schemas/blocks/shared/link";
import { colorVariant } from "./schemas/blocks/shared/color-variant";
import { buttonVariant } from "./schemas/blocks/shared/button-variant";
import sectionPadding from "./schemas/blocks/shared/section-padding";

export const schemaTypes = [
  // documents
  page,
  faq,
  navigation,
  settings,
  storyChapter,
  entourageMember,
  guest,
  announcement,
  // shared objects
  blockContent,
  link,
  colorVariant,
  buttonVariant,
  sectionPadding,
];
