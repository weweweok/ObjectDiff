import { mergeDiff } from "./main.ts";
import { getAccentPhrases } from "./main.ts";
import { diff, jsonPatchPathConverter } from "https://esm.sh/just-diff@6.0.2";
const beforeAccents = await getAccentPhrases("五千兆円欲しい");
const afterAccents = await getAccentPhrases("五千万円欲しい");

// console.log(beforeAccents[0].moras, afterAccents[0].moras);
// console.log(mergeDiff(beforeAccents, afterAccents));

// console.log(
//   "=====================================================",
//   mergeDiff(beforeAccents, afterAccents)
// );
console.log(JSON.stringify(beforeAccents));
console.log(JSON.stringify(afterAccents));
const merged = mergeDiff(beforeAccents, afterAccents);

console.log(JSON.stringify(merged));
