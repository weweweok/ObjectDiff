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

async function comprehensiveTest(beforestring: string, afterstring: string) {
  const beforeAccents = await getAccentPhrases(beforestring);
  const afterAccents = await getAccentPhrases(afterstring);

  // morasからmoras.textで構成される文字列を生成する
  const afterMoras = pluck(JSON.parse(JSON.stringify(afterAccents)), "moras");

  const mergeAccent = mergeDiff(beforeAccents, afterAccents);
  // morasからmoras.textで構成される文字列を生成する
  const mergeMoras = pluck(JSON.parse(JSON.stringify(mergeAccent)), "moras");

  const AfterMorasText = getMoraText(afterMoras).join("");
  const mergeMorasText = getMoraText(mergeMoras).join("");
  if (AfterMorasText === mergeMorasText)
    // マージ前のアクセントデータ(AfterAccent)とマージ後のアクセントデータを比較して
    //一致していなければbeforeAccentも適用されていると解釈してテストに合格
    assertNotEquals(
      mergeAccent,
      afterAccents,
      "もし、文字列が変わっていない場合、このテストはエラーになります"
    );
  else {
    assertEquals(mergeMorasText, AfterMorasText, "文字列が違います");
  }
}
Deno.test(
  "変更操作 (マージされたアクセントが正確に変更されているか検証しない)",
  async () => {
    await comprehensiveTest("こんにちは", "こんばんは");
    await comprehensiveTest(
      "ディープラーニングは万能薬ではありません",
      "機械学習は鎮痛剤ではありません"
    );
  }
);

Deno.test(
  "追加操作 (マージされたアクセントが正確に変更されているか検証しない)",
  async () => {
    await comprehensiveTest("こんにちは", "こんにちは、ずんだもんです");
    await comprehensiveTest(
      "こんにちは",
      "こんにちは、私はずんだもんではありません。桜田門です"
    );
  }
);

Deno.test(
  "削除操作 (マージされたアクセントが正確に変更されているか検証しない)",
  async () => {
    await comprehensiveTest(
      "こんにちは、ずんだもんです",
      "こんにちは、ずんだです"
    );
  }
);
