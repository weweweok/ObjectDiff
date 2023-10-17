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
    if (accent[index + 1] !== undefined) result.push("/");
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
  diffed.forEach((patch: DiffOperator) => {
    for (const char of patch.value) {
      if (char === "ャ" || char === "ュ" || char === "ョ" || char === "/") {
        --patch.count;
        if (char !== "/") patch.value.replace(char, "");
      }
    }
  });
  console.log(diffed);
  const plucked = pluck(before, "moras").flat();
  console.log("now moving ...");
  let afterCount1 = 0; // 最上階を表す
  let afterCount2 = 0; // mora番号
  while (plucked.length !== 0) {
    if (after.length === afterCount1) {
      break;
    } else if (after[afterCount1]["moras"].length === afterCount2) {
      ++afterCount1;
      afterCount2 = 0;
      continue;
    }
    if (diffed[0].added) {
      for (const Char of diffed[0].value) {
        if (Char === "/") {
          break;
        } else {
          afterCount2++;
        }
      }
      for (
        let charCounter = 0;
        charCounter < Number(diffed[0].count);
        charCounter++
      ) {
        plucked.shift();
      }
      diffed.shift();
      if (after[afterCount1]["moras"][afterCount2] === undefined) {
        ++afterCount1;
        afterCount2 = 0;
      }
      continue;
    }

    if (diffed[0].removed) {
      for (const Char of diffed[0].value) {
        if (Char === "/") {
          ++afterCount1;
          afterCount2 = 0;
          break;
        } else {
          ++afterCount2;
        }
      }
      for (let charCounter = 0; charCounter < diffed[0].count; charCounter++) {
        plucked.shift();
      }
      diffed.shift();
      if (after[afterCount1]["moras"][afterCount2] === undefined) {
        ++afterCount1;
        afterCount2 = 0;
      }
      continue;
    }

    if (after[afterCount1]["moras"][afterCount2].text === plucked[0].text)
      after[afterCount1]["moras"][afterCount2] = plucked[0];

    plucked.shift();
    ++afterCount2;
  }

  return after;
}
