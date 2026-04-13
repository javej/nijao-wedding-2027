import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  BookOpen,
  CalendarHeart,
  Files,
  Heart,
  ListCollapse,
  Megaphone,
  Menu,
  Settings,
  Shirt,
  User,
  Users,
} from "lucide-react";

export const structure = (S: any, context: any) =>
  S.list()
    .title("Content")
    .items([
      // Wedding Content
      S.listItem()
        .title("Wedding Content")
        .icon(Heart)
        .child(
          S.list()
            .title("Wedding Content")
            .items([
              orderableDocumentListDeskItem({
                type: "storyChapter",
                title: "Story Chapters",
                icon: BookOpen,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: "entourageMember",
                title: "Entourage",
                icon: Users,
                S,
                context,
              }),
              S.documentTypeListItem("guest")
                .title("Guests")
                .icon(User),
              S.documentTypeListItem("announcement")
                .title("Announcements")
                .icon(Megaphone),
              S.listItem()
                .title("Wedding Details")
                .icon(CalendarHeart)
                .child(
                  S.editor()
                    .id("weddingDetails")
                    .schemaType("weddingDetails")
                    .documentId("weddingDetails"),
                ),
              S.listItem()
                .title("Dress Code")
                .icon(Shirt)
                .child(
                  S.editor()
                    .id("dressCode")
                    .schemaType("dressCode")
                    .documentId("dressCode"),
                ),
            ]),
        ),
      S.divider(),
      // Pages
      orderableDocumentListDeskItem({
        type: "page",
        title: "Pages",
        icon: Files,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "faq",
        title: "FAQs",
        icon: ListCollapse,
        S,
        context,
      }),
      S.divider(),
      // Global
      S.listItem()
        .title("Navigation")
        .icon(Menu)
        .child(
          S.editor()
            .id("navigation")
            .schemaType("navigation")
            .documentId("navigation"),
        ),
      S.listItem()
        .title("Settings")
        .icon(Settings)
        .child(
          S.editor()
            .id("settings")
            .schemaType("settings")
            .documentId("settings"),
        ),
    ]);
