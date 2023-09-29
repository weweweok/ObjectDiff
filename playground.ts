import { mergeDiff } from "./main.ts";
import { getAccentPhrases } from "./main.ts";

const beforeAccents = await getAccentPhrases("文字列");
const afterAccents = await getAccentPhrases("文字列文字列");

console.log(mergeDiff(beforeAccents, afterAccents));
