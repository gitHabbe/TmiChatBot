import Fuse from "fuse.js";
import { fuseOptions } from "../config/fusejsConfig";
import { CategoryType } from "../interfaces/speedrun";

export const fuseSearchCategory = (
  categories: CategoryType[],
  categoryQuery: string
) => {
  let term = categories.find((category) => category.name === categoryQuery);
  // term = term === undefined ? categoryQuery : term.name;
  // if (term === undefined) term = categoryQuery;
  const categoriesList = categories;
  const fusejsOptions: Fuse.IFuseOptions<CategoryType> = fuseOptions;
  const fuseObject = new Fuse(categoriesList, fusejsOptions);
  const fuseSearch = fuseObject.search(categoryQuery);

  return fuseSearch;
};
