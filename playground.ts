import { mergeDiff } from "./main.ts";
import { getAccentPhrases } from "./main.ts";
import { diff, jsonPatchPathConverter } from "https://esm.sh/just-diff@6.0.2";
const beforeAccents = await getAccentPhrases("こんにちは、ずんだもんです");
const afterAccents = await getAccentPhrases("こんにちは、ずんだです");

// console.log(JSON.stringify(beforeAccents));
console.log(JSON.stringify(afterAccents));
const merged = mergeDiff(beforeAccents, afterAccents);

console.log(JSON.stringify(merged));
