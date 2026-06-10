import {
  defineDocuments,
  PresentationPluginOptions,
} from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {},
  mainDocuments: defineDocuments([
    {
      route: "/:slug",
      filter: `_type == 'guest' && slug.current == $slug`,
    },
  ]),
};
