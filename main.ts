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

function getMorasFromAccentPhrases(accent: any) {
  const result: any[] = [];
  accent.forEach((element: any, index: number) => {
    const plucked = pluck(element.moras, "text");
    const text = plucked.join("");
    result.push(text);
  });
  return result;
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
  const diffed: DiffOperator[] | any = Diff.diffChars(
    getMorasFromAccentPhrases(before).join(""),
    getMorasFromAccentPhrases(after).join("")
  );

  console.log(diffed);
  const pluckedBefore = pluck(before, "moras").flat();
  const pluckedAfter = pluck(after, "moras").flat();
  let pluckedIndex = 0;
  for (const diff of diffed) {
    if (diff.removed) {
      let removesmallchar = 0;
      for (
        let removeValueIndex = 0;
        removeValueIndex < diff.value.length;
        removeValueIndex++
      ) {
        if (
          diff.value[removeValueIndex] === "ャ" ||
          diff.value[removeValueIndex] === "ュ" ||
          diff.value[removeValueIndex] === "ョ"
        ) {
          ++removesmallchar;
        }
      }
      pluckedBefore.splice(pluckedIndex - 1, diff.count - removesmallchar);
      pluckedIndex += diff.count - removesmallchar;
    } else if (diff.added) {
      for (let valueIndex = 0; valueIndex < diff.value.length; valueIndex++) {
        if (
          diff.value[valueIndex + 1] === "ャ" ||
          diff.value[valueIndex + 1] === "ュ" ||
          diff.value[valueIndex + 1] === "ョ"
        ) {
          pluckedBefore.splice(
            pluckedIndex,
            0,
            String(diff.value[valueIndex]) + String(diff.value[valueIndex + 1])
          );
          ++valueIndex;
        } else {
          pluckedBefore.splice(pluckedIndex, 0, diff.value[valueIndex]);
        }
        ++pluckedIndex;
      }
    } else {
      // 削除も変更もしないfor文を記述
      for (const char of diff.value) {
        if (char === "ャ" || char === "ュ" || char === "ョ") continue;
        else ++pluckedIndex;
      }
    }
  }

  console.log(pluckedBefore);
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
