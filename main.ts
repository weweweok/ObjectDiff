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
    (v) => v.op === "add"
  );
  const diffReplacedFromBefore = diffed.filter(
    (v) => v["op"] === "replace" && v["path"].includes("text")
  );
  const diffadded = diffed.filter((v) => v["op"] === "add");
  const diffremoved = diffed.filter((v) => v["op"] === "remove");

  // 変更操作(挿入かつ削除)
  /*同じ文字で過去のデータが現在のデータに上書きされないようにしたい*/
  for (const beforevalue of diffReplacedFromBefore) {
    for (const aftervalue of diffRepacedFromAfter) {
      // 過去の変更内容のtextと今変更された内容が等しくなく、現在の変更と一致する場合、採用する
      if (
        before[Number(beforevalue.path[0])][beforevalue.path[1]][
          beforevalue.path[2]
        ][beforevalue.path[3]] !== beforevalue.value &&
        before[Number(beforevalue.path[0])][beforevalue.path[1]][
          beforevalue.path[2]
        ] === aftervalue.value
      )
        if (
          before[Number(beforevalue.path[0])][beforevalue.path[1]][
            beforevalue.path[2]
          ].text ===
          after[Number(aftervalue.path[0])][aftervalue.path[1]][
            aftervalue.path[2]
          ].text
        ) {
          // 過去の変更内容のtextと今変更された内容が等しくなく、現在の変更と一致する場合、採用する
          // 、過去データ、現在のデータで、モーラ文字が等しいとき、値を採用する
          before[Number(beforevalue.path[0])][beforevalue.path[1]][
            beforevalue.path[2]
          ] = aftervalue.value;
          break;
        }
      // 過去の変更内容のtextと今変更された内容が等しくなく、現在の変更と一致する場合、採用する
      before[Number(beforevalue.path[0])][beforevalue.path[1]][
        beforevalue.path[2]
      ] =
        after[Number(beforevalue.path[0])][beforevalue.path[1]][
          beforevalue.path[2]
        ];
    }
  }

  // 削除操作
  for (const value of diffremoved) {
    if (before[Number(value.path[0])][value.path[1]] !== undefined) {
      before[Number(value.path[0])][value.path[1]].splice(value.path[2], 1);
    } else if (before[Number(value.path[0])] !== undefined) {
      before.splice(value.path[0], 1);
    }
  }

  // 挿入操作 (アクセントごと(句点の追加の場合)、モーラごと(同じ空間内での追加)に対応)
  for (const value of diffadded) {
    if (before[Number(value.path[0])] === undefined) before.push(value.value);
    else if (before[Number(value.path[0])][value.path[1]] === undefined)
      before[Number(value.path[0])][value.path[1]].push(value.value);
    else if (
      before[Number(value.path[0])][value.path[1]][value.path[2]] === undefined
    )
      before[Number(value.path[0])][value.path[1]][value.path[2]] = value.value;
  }
  return before;
}
