import { assertNotEquals } from "https://deno.land/std@0.198.0/assert/mod.ts";
import { mergeDiff, getAccentPhrases } from "./main.ts";

import pluck from "https://esm.sh/v132/just-pluck-it@2.3.0";
import { assertEquals } from "https://deno.land/std@0.198.0/assert/assert_equals.ts";

function getMoraText(AccentPhrases: any) {
  const target: any[] = [];
  AccentPhrases.forEach((Phrase: any) => {
    for (const mora of Phrase) {
      target.push(mora.text);
    }
  });
  return target;
}
// moraの文字がafterAccentsとmergeDiffで一致し、なおかつafterAccentsとmergeDiffのオブジェクトが一致していないと正しい
Deno.test(
  "追加操作 (マージされたテストが正確に変更されているか検証しない)",
  async () => {
    const beforeAccents = await getAccentPhrases("こんばんは");
    const afterAccents = await getAccentPhrases("こんにちは");

    const afterMoras = pluck(JSON.parse(JSON.stringify(afterAccents)), "moras");

    const mergeAccent = mergeDiff(beforeAccents, afterAccents);
    const mergeMoras = pluck(JSON.parse(JSON.stringify(mergeAccent)), "moras");

    const morasText = getMoraText(afterMoras).join("");
    const mergeMorasText = getMoraText(mergeMoras).join("");

    if (morasText === mergeMorasText)
      assertNotEquals(
        mergeAccent,
        afterAccents,
        "もし、文字列が変わっていない場合、このテストはエラーになります"
      );
    else {
      assertEquals(mergeMorasText, morasText, "文字列が違います");
    }
  }
);
