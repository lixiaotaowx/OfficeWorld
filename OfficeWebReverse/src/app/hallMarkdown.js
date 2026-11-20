// Markdown rendering stack (marked, recovered verbatim): lexer/tokenizer
// classes and rules (mi/Ft/No/D0..O2), html escaping (X) and option helpers
// (U5/vt/Ct). Recovered from chunks/HallView.js; only imports/exports added.


function mi() {
  return {
    async: !1,
    breaks: !1,
    extensions: null,
    gfm: !0,
    hooks: null,
    pedantic: !1,
    renderer: null,
    silent: !1,
    tokenizer: null,
    walkTokens: null
  }
}
var Ft = mi();

function U5(r) {
  Ft = r
}
var vt = {
  exec: () => null
};

function Ct(r) {
  let e = [];
  return t => {
    let s = Math.max(0, Math.min(3, t - 1)),
      i = e[s];
    return i || (i = r(s), e[s] = i), i
  }
}

function X(r, e = "") {
  let t = typeof r == "string" ? r : r.source,
    s = {
      replace: (i, n) => {
        let o = typeof n == "string" ? n : n.source;
        return o = o.replace(D0.caret, "$1"), t = t.replace(i, o), s
      },
      getRegex: () => new RegExp(t, e)
    };
  return s
}
var No = ((r = "") => {
    try {
      return !!new RegExp("(?<=1)(?<!1)" + r)
    } catch {
      return !1
    }
  })(),
  D0 = {
    codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm,
    outputLinkReplace: /\\([\[\]])/g,
    indentCodeCompensation: /^(\s+)(?:```)/,
    beginningSpace: /^\s+/,
    endingHash: /#$/,
    startingSpaceChar: /^ /,
    endingSpaceChar: / $/,
    endingSpaceTabChar: /[ \t]$/,
    nonSpaceChar: /[^ ]/,
    newLineCharGlobal: /\n/g,
    tabCharGlobal: /\t/g,
    leadingSpaceTab: /^[ \t]+/,
    multipleSpaceGlobal: /\s+/g,
    blankLine: /^[ \t]*$/,
    doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
    blockquoteStart: /^ {0,3}>/,
    blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
    blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
    blockquoteMarkerWhitespace: /^( {0,3}>)([ \t]+)/gm,
    listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
    listIsTask: /^\[[ xX]\] +\S/,
    listReplaceTask: /^\[[ xX]\] +/,
    listTaskCheckbox: /\[[ xX]\]/,
    anyLine: /\n.*\n/,
    hrefBrackets: /^<(.*)>$/,
    tableDelimiter: /[:|]/,
    tableAlignChars: /^\||\| *$/g,
    tableRowBlankLine: /\n[ \t]*$/,
    tableAlignRight: /^ *-+: *$/,
    tableAlignCenter: /^ *:-+: *$/,
    tableAlignLeft: /^ *:-+ *$/,
    startATag: /^<a /i,
    endATag: /^<\/a>/i,
    startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
    endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
    startAngleBracket: /^</,
    endAngleBracket: />$/,
    pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
    unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
    numericCharacterReference: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,
    numericCharacterReferenceOrAmpersand: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
    escapeTest: /[&<>"']/,
    escapeReplace: /[&<>"']/g,
    escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
    escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
    caret: /(^|[^\[])\^/g,
    percentDecode: /%25/g,
    findPipe: /\|/g,
    splitPipe: / \|/,
    slashPipe: /\\\|/g,
    carriageReturn: /\r\n|\r/g,
    spaceLine: /^ +$/gm,
    notSpaceStart: /^\S*/,
    endingNewline: /\n$/,
    listItemRegex: r => new RegExp(`^( {0,3}${r})((?:[	 ][^\\n]*)?(?:\\n|$))`),
    nextBulletRegex: Ct(r => new RegExp(`^ {0,${r}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),
    hrRegex: Ct(r => new RegExp(`^ {0,${r}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),
    fencesBeginRegex: Ct(r => new RegExp(`^ {0,${r}}(?:\`\`\`|~~~)`)),
    headingBeginRegex: Ct(r => new RegExp(`^ {0,${r}}#{1,6}(?:\\s|$)`)),
    pedanticHeadingBeginRegex: Ct(r => new RegExp(`^ {0,${r}}#`)),
    htmlBeginRegex: Ct(r => new RegExp(`^ {0,${r}}(?:</?(?:${F1})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, "i")),
    blockquoteBeginRegex: Ct(r => new RegExp(`^ {0,${r}}>`))
  },
  Po = /^(?:[ \t]*(?:\n|$))+/,
  Uo = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,
  Go = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
  R1 = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
  zo = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
  Ii = / {0,3}(?:[*+-]|\d{1,9}[.)])/,
  G5 = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  z5 = X(G5).replace(/bull/g, Ii).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(),
  _o = X(G5).replace(/bull/g, Ii).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),
  Ei = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,
  Oo = /^[^\n]+/,
  Ci = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,
  Ho = X(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Ci).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),
  jo = X(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, Ii).getRegex(),
  F1 = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",
  yi = /<!--(?:-?>|[\s\S]*?(?:-->|$))/,
  qo = X("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", yi).replace("tag", F1).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),
  _5 = r => X(Ei).replace("hr", R1).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", r).replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", F1).getRegex(),
  Wo = _5(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),
  Vo = _5(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),
  Yo = X(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace("paragraph", Vo).getRegex(),
  wi = {
    blockquote: Yo,
    code: Uo,
    def: Ho,
    fences: Go,
    heading: zo,
    hr: R1,
    html: qo,
    lheading: z5,
    list: jo,
    newline: Po,
    paragraph: Wo,
    table: vt,
    text: Oo
  },
  L2 = X("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", R1).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", F1).getRegex(),
  Jo = {
    ...wi,
    lheading: _o,
    table: L2,
    paragraph: X(Ei).replace("hr", R1).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", L2).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", F1).getRegex()
  },
  Ko = {
    ...wi,
    html: X(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", yi).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: vt,
    lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    paragraph: X(Ei).replace("hr", R1).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", z5).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
  },
  Xo = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  Zo = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  O5 = /^( {2,}|\\)\n(?!\s*$)[ \t]*/,
  $o = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
  Le = /[\p{P}\p{S}]/u,
  o1 = /[\s\p{P}\p{S}]/u,
  N1 = /[^\s\p{P}\p{S}]/u,
  ea = X(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, o1).getRegex(),
  ta = /[\p{Pi}\p{Ps}"']/u,
  H5 = /(?!~)[\p{P}\p{S}]/u,
  sa = /(?!~)[\s\p{P}\p{S}]/u,
  ia = /(?:[^\s\p{P}\p{S}]|~)/u,
  na = X(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", No ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(),
  j5 = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,
  ra = X(j5, "u").replace(/punct/g, Le).getRegex(),
  oa = X(j5, "u").replace(/punct/g, H5).getRegex(),
  aa = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,
  la = X(aa, "u").replace(/openQuote/g, ta).replace(/punct/g, Le).getRegex(),
  q5 = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",
  Aa = X(q5, "gu").replace(/notPunctSpace/g, N1).replace(/punctSpace/g, o1).replace(/punct/g, Le).getRegex(),
  ca = X(q5, "gu").replace(/notPunctSpace/g, ia).replace(/punctSpace/g, sa).replace(/punct/g, H5).getRegex(),
  ha = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)",
  ua = X(ha, "gu").replace(/notPunctSpace/g, N1).replace(/punctSpace/g, o1).replace(/punct/g, Le).getRegex(),
  da = X("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, N1).replace(/punctSpace/g, o1).replace(/punct/g, Le).getRegex(),
  ga = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)",
  fa = X(ga, "gu").replace(/notPunctSpace/g, N1).replace(/punctSpace/g, o1).replace(/punct/g, Le).getRegex(),
  pa = X(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, Le).getRegex(),
  ma = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",
  Ia = X(ma, "gu").replace(/notPunctSpace/g, N1).replace(/punctSpace/g, o1).replace(/punct/g, Le).getRegex(),
  Ea = X(/\\(punct)/, "gu").replace(/punct/g, Le).getRegex(),
  Ca = X(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/, "gu").replace(/punct/g, Le).getRegex(),
  ya = X(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),
  wa = X(yi).replace("(?:-->|$)", "-->").getRegex(),
  Ba = X("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", wa).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),
  W5 = /\[(?:\\[\s\S]|[^\[\]\\])*\]/,
  v9 = X(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", W5).getRegex(),
  xa = X(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label", v9).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),
  ba = X(/^!?\[(label)\]\[(ref)\]/).replace("label", v9).replace("ref", Ci).getRegex(),
  va = X(/^!?\[(ref)\](?:\[\])?/).replace("ref", Ci).getRegex(),
  R2 = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,
  Qa = X(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", W5).getRegex(),
  Sa = X("reflink|nolink(?!\\()", "g").replace("reflink", X(/^!?\[(label)\]\[(ref)\]/).replace("label", Qa).replace("ref", R2).getRegex()).replace("nolink", X(/^!?\[(ref)\](?:\[\])?/).replace("ref", R2).getRegex()).getRegex(),
  F2 = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,
  Ma = /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/,
  ka = X(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g, Ma).getRegex(),
  Bi = {
    _backpedal: vt,
    anyPunctuation: Ea,
    anyPunctuationOutsideCode: Ca,
    autolink: ya,
    blockSkip: na,
    br: O5,
    code: Zo,
    del: vt,
    delLDelim: vt,
    delRDelim: vt,
    emStrongLDelim: ra,
    emStrongRDelimAst: Aa,
    emStrongRDelimUnd: da,
    escape: Xo,
    link: xa,
    nolink: va,
    punctuation: ea,
    reflink: ba,
    reflinkSearch: Sa,
    tag: Ba,
    text: $o,
    url: vt
  },
  Ta = {
    ...Bi,
    emStrongLDelim: la,
    emStrongRDelimAst: ua,
    emStrongRDelimUnd: fa,
    link: X(/^!?\[(label)\]\((.*?)\)/).replace("label", v9).getRegex(),
    reflink: X(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", v9).getRegex()
  },
  Zs = {
    ...Bi,
    emStrongRDelimAst: ca,
    emStrongLDelim: oa,
    delLDelim: pa,
    delRDelim: Ia,
    url: X(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol", ka).replace("protocol", F2).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),
    _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
    text: X(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol", F2).replace(/emailProtocol/g, /(?:mailto|xmpp):/).getRegex()
  },
  Da = {
    ...Zs,
    br: X(O5).replace("{2,}", "*").getRegex(),
    text: X(Zs.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
  },
  l9 = {
    normal: wi,
    gfm: Jo,
    pedantic: Ko
  },
  d1 = {
    normal: Bi,
    gfm: Zs,
    breaks: Da,
    pedantic: Ta
  },
  La = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  },
  N2 = r => La[r];

function se(r, e) {
  if (e) {
    if (D0.escapeTest.test(r)) return r.replace(D0.escapeReplace, N2)
  } else if (D0.escapeTestNoEncode.test(r)) return r.replace(D0.escapeReplaceNoEncode, N2);
  return r
}

function Ra(r) {
  return D0.numericCharacterReference.test(r) ? r.replace(D0.numericCharacterReferenceOrAmpersand, (e, t, s) => {
    if (t === void 0 && s === void 0) return "&amp;";
    let i = t === void 0 ? Number.parseInt(s, 16) : Number.parseInt(t, 10);
    return i === 0 || i > 1114111 || i >= 55296 && i <= 57343 ? "�" : i === 38 ? "&amp;" : String.fromCodePoint(i)
  }) : r
}

function P2(r) {
  try {
    r = encodeURI(r).replace(D0.percentDecode, "%")
  } catch {
    return null
  }
  return r
}

function U2(r, e) {
  var n;
  let t = r.replace(D0.findPipe, (o, a, l) => {
      let A = !1,
        c = a;
      for (; --c >= 0 && l[c] === "\\";) A = !A;
      return A ? "|" : " |"
    }),
    s = t.split(D0.splitPipe),
    i = 0;
  if (s[0].trim() || s.shift(), s.length > 0 && !((n = s.at(-1)) != null && n.trim()) && s.pop(), e)
    if (s.length > e) s.splice(e);
    else
      for (; s.length < e;) s.push("");
  for (; i < s.length; i++) s[i] = s[i].trim().replace(D0.slashPipe, "|");
  return s
}

function at(r, e, t) {
  let s = r.length;
  if (s === 0) return "";
  let i = 0;
  for (; i < s && r.charAt(s - i - 1) === e;) i++;
  return r.slice(0, s - i)
}

function G2(r) {
  let e = r.split(`
`),
    t = e.length - 1;
  for (; t >= 0 && D0.blankLine.test(e[t]);) t--;
  return e.length - t <= 2 ? r : e.slice(0, t + 1).join(`
`)
}

function Q9(r) {
  return r.trim().toLowerCase().toUpperCase().toLowerCase()
}

function z2(r, e) {
  if (r.indexOf(e[0]) === -1 && r.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let s = 0; s < r.length; s++)
    if (r[s] === "\\") s++;
    else if (r[s] === e[0]) t++;
  else if (r[s] === e[1] && (t--, t < 0)) return s;
  return t > 0 ? -2 : -1
}

function A9(r, e = 0) {
  let t = e,
    s = "";
  for (let i of r)
    if (i === "	") {
      let n = 4 - t % 4;
      s += " ".repeat(n), t += n
    } else s += i, t++;
  return s
}

function _2(r, e, t, s, i) {
  let n = e.href,
    o = e.title || null,
    a = r[1].replace(i.other.outputLinkReplace, "$1"),
    l = r[0].charAt(0) === "!",
    A = s.state.inLink,
    c = s.state.linkEmitted,
    h = s.state.inRawBlock;
  s.state.inLink = !0, s.state.linkEmitted = !1;
  let u = s.inlineTokens(a),
    d = s.state.linkEmitted;
  if (s.state.linkEmitted = c, s.state.inLink = A, !l) {
    if (d) {
      s.state.inRawBlock = h;
      return
    }
    s.state.linkEmitted = !0
  }
  return {
    type: l ? "image" : "link",
    raw: t,
    href: n,
    title: o,
    text: a,
    tokens: u
  }
}

function Fa(r, e, t) {
  let s = r.match(t.other.indentCodeCompensation);
  if (s === null) return e;
  let i = s[1];
  return e.split(`
`).map(n => {
    let o = n.match(t.other.beginningSpace);
    if (o === null) return n;
    let [a] = o;
    return n.slice(Math.min(a.length, i.length))
  }).join(`
`)
}

function O2(r, e, t, s) {
  if (!e.includes("<")) return !1;
  for (let i = 0; i < e.length; i++) {
    if (e[i] === "\\") {
      i++;
      continue
    }
    if (e[i] === "`") {
      let a = s.inline.code.exec(e.slice(i));
      if (a) {
        i += a[0].length - 1;
        continue
      }
    }
    if (e[i] !== "<") continue;
    let n = r.slice(t + i),
      o = s.inline.tag.exec(n) || s.inline.autolink.exec(n);
    if (o) {
      if (o[0].length > e.length - i) return !0;
      i += o[0].length - 1
    }
  }
  return !1
}

export { mi, Ft, U5, X, D0, aa, ba, l9, d1, se, Ra, P2, U2, at, G2, Q9, z2, A9, _2, Fa, O2 };
