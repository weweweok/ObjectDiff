import ky from "https://esm.sh/ky";
import pluck from "https://esm.sh/v132/just-pluck-it@2.3.0/index.js";
import * as Diff from "https://esm.sh/diff@5.1.0";
/**
 *VOICEVOX_ENGINEからアクセントデータを取得する関数
 */
export function getAccentPhrases(str: string) {
  const pushed = `http://localhost:50021/accent_phrases?text=${str}&speaker=1`;
  return ky
    .post(pushed)
    .json()
    .catch((res) => console.error("VOICEVOXの起動が必須です"));
}

interface DiffOperator {
  count: number;
  added?: boolean | undefined;
  removed?: boolean | undefined;
  value: string;
}

export function mergeDiff(beforeAccent: any, afterAccent: any) {
  const after = JSON.parse(JSON.stringify(afterAccent));
  const before = JSON.parse(JSON.stringify(beforeAccent));

  const pluckedBefore = pluck(before, "moras").flat();
  const pluckedAfter = pluck(after, "moras").flat();
  const diffed = Diff.diffArrays(
    pluck(JSON.parse(JSON.stringify(pluckedBefore)), "text"),
    pluck(JSON.parse(JSON.stringify(pluckedAfter)), "text")
  );
  console.log(diffed);
  let pluckedIndex = 0;
  for (const diff of diffed) {
    if (diff.removed) {
      pluckedBefore.splice(pluckedIndex, diff.count);
    } else if (diff.added) {
      for (let valueIndex = 0; valueIndex < diff.value.length; valueIndex++) {
        pluckedBefore.splice(pluckedIndex, 0, diff.value[valueIndex]);
        ++pluckedIndex;
      }
    } else {
      // 削除も変更もしないfor文を記述
      for (const char of diff.value) {
        ++pluckedIndex;
      }
    }
  }
  const pluckstring = [];
  for (const data of pluckedBefore) {
    if (typeof data === "string") pluckstring.push(data);
    else pluckstring.push(data.text);
  }
  console.log(pluckstring.join("") === pluck(pluckedAfter, "text").join(""));
  let beforeIndex = 0;
  for (let AccentIndex = 0; AccentIndex < after.length; AccentIndex++) {
    for (
      let MoraIndex = 0;
      MoraIndex < after[AccentIndex]["moras"].length;
      MoraIndex++
    ) {
      if (typeof pluckedBefore[beforeIndex] === "string") {
        ++beforeIndex;
        continue;
      }
      if (
        after[AccentIndex]["moras"][MoraIndex].text ===
        pluckedBefore[beforeIndex].text
      ) {
        after[AccentIndex]["moras"][MoraIndex] = pluckedBefore[beforeIndex];
      }
      ++beforeIndex;
    }
  }

  return after;
}
