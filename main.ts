import { diff } from "https://esm.sh/just-diff@6.0.2";
import ky from "https://esm.sh/ky";
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

/*
 *オブジェクトの追加、変更、削除をマージする関数
 * path[index],path[index+1]と順番にたどることで変更箇所に到達可能
 * こんにちは -> あに ではうごかない
 */
export function mergeDiff(before: any, after: any) {
  const diffed = diff(before, after);

  const diffRepacedFromAfter = diff(after, before).filter(
    (v) => v.op === "replace" && v.path.includes("text")
  );
  const diffReplacedFromBefore = diffed.filter(
    (v) => v["op"] === "replace" && v.path.includes("text")
  );
  const diffadded = diffed.filter((v) => v["op"] === "add");
  const diffremoved = diffed.filter((v) => v["op"] === "remove");

  // 変更操作(挿入かつ削除)
  const seen: boolean[][] = Array(100)
    .fill(false)
    .map(() => Array(100).fill(false));

  const seenAfter: boolean[][] = Array(100)
    .fill(false)
    .map(() => Array(100).fill(false));

  const copiedBefore = JSON.parse(JSON.stringify(before));
  const copiedAfter = JSON.parse(JSON.stringify(after));

  diffReplacedFromBefore.forEach((beforevalue) => {
    diffRepacedFromAfter.forEach((aftervalue) => {
      if (
        !seen[Number(beforevalue.path[0])][Number(beforevalue.path[2])] &&
        !seenAfter[Number(aftervalue.path[0])][Number(aftervalue.path[2])]
      ) {
        seen[Number(beforevalue.path[0])][Number(beforevalue.path[2])] = true;
        seenAfter[Number(aftervalue.path[0])][Number(aftervalue.path[2])] =
          true;
        copiedBefore[beforevalue.path[0]][beforevalue.path[1]][
          beforevalue.path[2]
        ] =
          copiedAfter[aftervalue.path[0]][aftervalue.path[1]][
            aftervalue.path[2]
          ];
      }
    });
  });

  // 削除操作
  for (const value of diffremoved) {
    if (copiedBefore[Number(value.path[0])][value.path[1]] !== undefined) {
      copiedBefore[Number(value.path[0])][value.path[1]].splice(
        value.path[2],
        1
      );
    } else if (copiedBefore[Number(value.path[0])] !== undefined) {
      copiedBefore.splice(value.path[0], 1);
    }
  }

  // 挿入操作 (アクセントごと(句点の追加の場合)、モーラごと(同じ空間内での追加)に対応)
  for (const value of diffadded) {
    if (copiedBefore[Number(value.path[0])] === undefined)
      copiedBefore.push(value.value);
    else if (copiedBefore[Number(value.path[0])][value.path[1]] === undefined)
      copiedBefore[Number(value.path[0])][value.path[1]].push(value.value);
    else if (
      copiedBefore[Number(value.path[0])][value.path[1]][value.path[2]] ===
      undefined
    )
      copiedBefore[Number(value.path[0])][value.path[1]][value.path[2]] =
        value.value;
  }
  return copiedBefore;
}
