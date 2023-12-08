import ky from "https://esm.sh/ky";
import pluck from "https://esm.sh/v132/just-pluck-it@2.3.0/index.js";
import * as Diff from "https://esm.sh/diff@5.1.0";
import { diffArrays } from "https://esm.sh/diff@5.1.0";
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

/**
 * 新しく変更されるアクセント句に対して、変更前のモーラを適用するクラス
 *
 * まず、過去と現在のアクセント句から、モーラ配列を作成する。
 * モーラ配列の各テキストを配列にまとめ、得られた2つの配列より、差分を検出する。
 * 検出した差分の追加、削除、それ以外の状況に応じて、変更前のモーラ配列に対して、文字列の挿入、配列自体の削除
 * を適用し、変更前のモーラ配列のテキストと変更後のアクセント句のモーラ配列のテキストを一致するようにする。
 * 最後に、変更後のアクセント句を走査して、変更前のモーラ配列のオブジェクト部分を変更後のアクセント句のモーラに適用する。
 */
export class AccentDiff {
  beforeAccent;
  afterAccent;
  constructor(beforeAccent: any, afterAccent: any) {
    this.afterAccent = JSON.parse(JSON.stringify(afterAccent));
    this.beforeAccent = JSON.parse(JSON.stringify(beforeAccent));
  }

  createFlatArray(collection: [], Key: string) {
    const targetAccent = JSON.parse(JSON.stringify(collection));
    const result = [];
    for (const element of targetAccent) {
      result.push(element[Key]);
    }
    return result;
  }

  /**
   * モーラのパッチ配列を作成するメンバ関数
   */
  createDiffPatch() {
    const after = JSON.parse(JSON.stringify(this.afterAccent));
    const before = JSON.parse(JSON.stringify(this.beforeAccent));

    const beforeFlatArray = this.createFlatArray(before, "moras");
    const afterFlatArray = this.createFlatArray(after, "moras");
    const diffed = diffArrays(
      this.createFlatArray(JSON.parse(JSON.stringify(beforeFlatArray)), "text"),
      this.createFlatArray(JSON.parse(JSON.stringify(afterFlatArray)), "text")
    );
    let pluckedIndex = 0;
    for (const diff of diffed) {
      if (diff.removed) {
        beforeFlatArray.splice(pluckedIndex, diff.count);
      } else if (diff.added) {
        for (const insertedText of diff.value) {
          beforeFlatArray.splice(pluckedIndex, 0, insertedText);
          ++pluckedIndex;
        }
      } else {
        diff.value.forEach(() => {
          ++pluckedIndex;
        });
      }
    }
    return beforeFlatArray;
  }
  /**
   * 変更後のアクセント句に、モーラパッチ配列を適用するメンバ関数
   */
  mergeAccentPhrases() {
    const after = JSON.parse(JSON.stringify(this.afterAccent));
    const MoraPatch = this.createDiffPatch();
    let beforeIndex = 0; // pluckedBeforeのデータの位置

    // 与えられたアクセント句は、AccentPhrases[ Nmber ][ Object Key][ Number ]の順番で、モーラを操作できるため、二重forで回す
    for (let AccentIndex = 0; AccentIndex < after.length; AccentIndex++) {
      for (
        let MoraIndex = 0;
        MoraIndex < after[AccentIndex]["moras"].length;
        MoraIndex++
      ) {
        // 文字列が検出されたとき、何もせず次のモーラへ移動
        if (typeof MoraPatch[beforeIndex] === "string") {
          ++beforeIndex;
          continue;
        }
        if (
          after[AccentIndex]["moras"][MoraIndex].text ===
          MoraPatch[beforeIndex].text
        ) {
          after[AccentIndex]["moras"][MoraIndex] = MoraPatch[beforeIndex];
        }
        ++beforeIndex;
      }
    }

    return after;
  }
}
