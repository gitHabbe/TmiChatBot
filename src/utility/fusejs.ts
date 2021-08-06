import Fuse from "fuse.js";
import { fuseOptions } from "../config/fusejsConfig";
import { ICategoryType } from "../interfaces/speedrun";
import { Category, CategoryLink } from ".prisma/client";

export const fuseSearchCategory = (
  categories: Category[],
  categoryQuery: string
) => {
  let term = categories.find((category) => category.name === categoryQuery);
  // term = term === undefined ? categoryQuery : term.name;
  // if (term === undefined) term = categoryQuery;
  const categoriesList = categories;
  const fusejsOptions: Fuse.IFuseOptions<Category> = fuseOptions;
  const fuseObject = new Fuse(categoriesList, fusejsOptions);
  // console.log("~ fuseObject", fuseObject);
  const fuseSearch = fuseObject.search(categoryQuery);
  if (fuseSearch.length === 0) throw new Error("Category not found");
  // console.log("~ fuseSearch", fuseSearch[0]);

  return fuseSearch;
};
