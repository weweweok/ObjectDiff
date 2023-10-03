import { mergeDiff } from "./main.ts";
import { getAccentPhrases } from "./main.ts";

const beforeAccents = await getAccentPhrases("ずんだもんの、朝食");
const afterAccents = await getAccentPhrases("ずんだもんの、夕食");

console.log(afterAccents);
console.log(mergeDiff(beforeAccents, afterAccents));
