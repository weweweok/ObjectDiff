# ObjectDiff

VOICEVOX のアクセントデータを良い感じにマージする発見法的プログラム

## Edit lib

main.ts に mergeDiff 関数があります。この関数の中身を編集してより良い結果を返すようにしています。
([just-diff](https://anguscroll.com/just/just-diff)を使用しています)

VOICEVOX 起動中に下記コマンドを打つとターミナル上にオブジェクトが表示されます(マージ前の変更後のデータとマージ済みのデータ)

```
deno run -A playground.ts
```

## test

テストは、アクセントモーラの文字列がマージ前とマージ後で一致し、なおかつ一つでもパラメータが一致しない場合に、正しいとしています。

(VOIECEVOX の起動が必須)

```
deno test -A
```
