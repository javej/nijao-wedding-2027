import { imageQuery } from "./image";

export const bodyQuery = `
  ...,
  markDefs[]{
    ...
  },
  _type == "image" => {
    ${imageQuery}
  }
`;
