import Fuse from "fuse.js";
import { fuseOptions } from "../config/fusejsConfig";
import { CategoryType } from "../interfaces/speedrun";

export const fuseSearchCategory = (
  categories: CategoryType[],
  categoryQuery: string
) => {
  let term = categories.find((category) => category.name === categoryQuery);
  if (term === undefined) term === categoryQuery;
  const categoriesList = categories;
  const asdf: Fuse.IFuseOptions<CategoryType> = fuseOptions;
  const fuseTest = new Fuse(categoriesList, asdf);
  // console.log("~ fuseTest", fuseTest);
  const fuseSearch = fuseTest.search(categoryQuery);
  console.log("~ fuseSearch", fuseSearch);

  return fuseSearch;
};
