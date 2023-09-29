import toPath from "https://esm.sh/underscore/modules/toPath.js";
import { getAccentPhrases } from "./main.ts";

const accent_phrases = await getAccentPhrases("こんにちは、ずんだもんです");

console.log(toPath(accent_phrases, "text"));
