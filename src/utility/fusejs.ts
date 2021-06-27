import Fuse from "fuse.js";
import { fuseOptions } from "../config/fusejsConfig";
import { CategoryType } from "../interfaces/speedrun";

export const fuseSearchCategory = (
  categories: CategoryType[],
  gameQuery: string
) => {
  const categoriesList = categories;
  const fuseTest = new Fuse(categoriesList, fuseOptions);
  console.log("~ fuseTest", fuseTest);
  const asdf = fuseTest.search(gameQuery);
  console.log("~ asdf", asdf);
};
