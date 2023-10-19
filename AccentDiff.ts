/**
 * 新しく変更されるアクセント句に対して、変更前のモーラを適用するクラス
 *
 *
 * まず、与えられた現在と過去のアクセント句のモーラを一つの配列にまとめる。こうして作られた過去と現在のモーラ配列を、
 * それぞれの「変更前モーラパッチ配列」「変更後モーラパッチ配列」と呼ぶことにする。
 * 「変更前モーラパッチ配列」と「変更後モーラパッチ配列」の各文字をテキスト化して、変更前から変更後への変更に対するテキスト差分を検出し、配列にまとめる。この配列を、テキストパッチ配列と呼ぶ。
 * 変更前モーラパッチ配列の中に、変化分の文字列を挿入、または、変更後の状態に合わせて、モーラを削除する操作を行う。
 * こうして作られたモーラ配列を、モーラパッチ配列と呼ぶ。
 * 最後に、変更後のアクセント句全体をモーラに対して走査し、モーラパッチ配列のモーラテキストとアクセント区のモーラテキストを比較して、テキストが一致していれば、
 * 変更後のアクセントモーラに対して、モーラパッチ配列の要素を適用する。
 */
export class AccentDiff {
  beforeAccent: AccentPhrase[];
  afterAccent: AccentPhrase[];
  constructor(beforeAccent: AccentPhrase[], afterAccent: AccentPhrase[]) {
    this.afterAccent = JSON.parse(JSON.stringify(afterAccent));
    this.beforeAccent = JSON.parse(JSON.stringify(beforeAccent));
  }
  /**
   * アクセント句のテキストを配列として返すメンバ関数
   */
  getMorasTextFromAccentPhrases(accent: AccentPhrase[]) {
    const result: string[] = [];
    accent.forEach((element: AccentPhrase) => {
      const plucked = pluck(element.moras, "text");
      const text = plucked.join("");
      result.push(text);
    });
    return result.join("");
  }
  /**
   * パッチモーラ配列を作成するメンバ関数
   */
  createMorasOrMorasTextArray() {
    const after = JSON.parse(JSON.stringify(this.afterAccent));
    const before = JSON.parse(JSON.stringify(this.beforeAccent));
    // テキストの差分検出
    const diffed: any = diffChars(
      this.getMorasTextFromAccentPhrases(before),
      this.getMorasTextFromAccentPhrases(after)
    );
    const pluckedBefore = pluck(before, "moras").flat(); // 変更前のアクセント句からモーラ配列を作成
    let pluckedIndex = 0; // 現在のモーラ配列の位置(テキストの位置)を表す。各操作に対して、非常に重要
    for (const diff of diffed) {
      if (diff.removed) {
        let removeForSmallCounter = 0; // ャ、ュ、ョといった文字を検出するたびに+1加算される
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
            ++removeForSmallCounter;
          }
        }
        pluckedBefore.splice(pluckedIndex, diff.count - removeForSmallCounter);
      } else if (diff.added) {
        for (let valueIndex = 0; valueIndex < diff.value.length; valueIndex++) {
          if (
            diff.value[valueIndex] === "ャ" ||
            diff.value[valueIndex] === "ュ" ||
            diff.value[valueIndex] === "ョ"
          ) {
            pluckedBefore.splice(
              pluckedIndex - 1,
              1,
              String(diff.value[valueIndex - 1]) +
                String(diff.value[valueIndex])
            );
            ++pluckedIndex;
          } else {
            pluckedBefore.splice(pluckedIndex, 0, diff.value[valueIndex]);
            ++pluckedIndex;
          }
        }
      } else {
        // 削除も変更もしないfor文を記述
        for (const char of diff.value) {
          if (char === "ャ" || char === "ュ" || char === "ョ") continue;
          else ++pluckedIndex;
        }
      }
    }
    return pluckedBefore;
  }
  /**
   * 変更後のアクセント句に、パッチモーラ配列を適用するメンバ関数
   */
  mergeAccentPhrases() {
    const after = JSON.parse(JSON.stringify(this.afterAccent));
    const pluckedBefore = this.createMorasOrMorasTextArray();
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
}
