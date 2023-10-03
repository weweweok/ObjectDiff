import { mergeDiff } from "./main.ts";
import { getAccentPhrases } from "./main.ts";

const beforeAccents = await getAccentPhrases(
  "この例文は、書き方のサンプルなので必要に応じて内容を追加削除をしてからお使いください。"
);
const afterAccents = await getAccentPhrases(
  "この例文は、書き方の一例なので必要に応じて内容を追加削除をしてからお使いください。"
);

console.log(afterAccents);
console.log(mergeDiff(beforeAccents, afterAccents));
