// 【使い方】
// Chromeでrename-tinfo.htmlを開く。
// 右側のテキストエリアに、ダンプファイルの内容をペーストする。
// 「番組名ソート(番組名のみ表示)」ボタンを押す。
// (番組名をキーに番組情報をソートし、番組名のみ表示)
//
// 番組名の書換え結果が満足できるまで、下記を繰り返す。
// 　書換え規則に正規表現で書換えルールを追記・修正。
// 　「規則に沿って番組名のみリネーム」ボタンを押す。
//
// 「javascriptソース形式で出力」ボタンを押す。
// (これにより、番組情報の欄に、書換え用情報が表示される。
//  この内容をdiga-tinfo.jsに流し込み、別のツールを使って
//  DIGAに番組名変更指示を出して、実際に番組名を変える）
//
// なお、一度入力した規則は、上記ボタンを押した際に、
// 【書換え規則(JSON)】欄に表示されるので、後で再利用
// する予定なら、テキストファイルにペーストして保管のこと。
// 次回利用時は、【書換え規則(JSON)】欄に、保管していた
// 書換え規則(JSON)をペーストし、「JSON形式の書換え規則取込」
// ボタンを押すと、書換え規則の欄に展開される。
//
// 【注意】
// 書換え規則には、Javascriptの正規表現を記載する。
// そのため"["などの特殊文字はバックスラッシュ"\"を
// 付ける必要あり。例えば"[再]"は、"\[再\]"と記載する。

"use strict"

var tinfoF = ""
var tinfoAA = []
var tinfoHeaderAA = []
var resultTinfoAA = []
var numCol = 7
var noCol = 0
var titleCol = 5
var sortCol = titleCol;

function sortTinfo() {
  tinfoAA = getTinfoAA()
  tinfoHeaderAA = tinfoAA.slice(0, 1)
  tinfoAA = tinfoAA.slice(1)
  sortCol = titleCol
  tinfoAA.sort(compAA)
  showAA(tinfoAA)
}

function inputJSON() {
  var ruleJSONF = $("textarea.ruleJSON")[0]
  var ruleJSON = ruleJSONF.value
  if (ruleJSON == "") {
    return
  }
  var ruleAA = JSON.parse(ruleJSON)

  var rule = $("div.rule")
  if (ruleAA.length > rule.length) {
    console.log("JSON include too many rules!")
  }

  for (var i = 0; i < Math.min(rule.length, ruleAA.length) ; i++) {
    var ruleA = ruleAA[i]
    if (ruleA) {
      var r = ruleA[0]
      var l = ruleA[1]
      var rl = rule[i];
      if (r) {
        rl.firstChild.value = r;
        rl.lastChild.value = l;
      }
    }
  }
}

function renameTinfo() {
  var ruleAA = getRuleAA()
  var resultAA = deepCopyAA(tinfoAA)
  for (var i = 0; i < ruleAA.length; i++) {
    var ruleA = ruleAA[i]
    if (ruleA) {
      applyRule(ruleA, resultAA)
    }
  }
  showAA(resultAA)
  resultTinfoAA = resultAA
}

function outputTinfoAndRule() {
  outputTinfo();
  outputRule();
}

function getTinfoAA() {
  var resultAA = []
  tinfoF = $("textarea.tinfo")[0]
  var tinfo = tinfoF.value
  var tinfoA = tinfo.split("\n")
  var numRinfo = 0
  for (var i = 0; i < tinfoA.length; i++) {
    var rinfo = tinfoA[i]
    rinfo = rinfo.replace(/^[\s\t]+/, "")
    var rinfoA = rinfo.split("\t")
    if (rinfoA.length != numCol) {
      console.log("line(" + i + ") length != 7 :", rinfoA)
      continue
    }
    resultAA[numRinfo++] = rinfoA
  }
  return resultAA
    // console.log(resultAA)
}

function outputTinfo() {
  sortCol = noCol
  resultTinfoAA.sort(compAA)
  var outputAA = tinfoHeaderAA.concat(resultTinfoAA)
  var tinfo = "var tinfo = [\n";
  for (var i = 0; i < outputAA.length; i++) {
    var rinfoA = outputAA[i];
    var rinfo = '["'
    for (var j = 0; j < rinfoA.length; j++) {
      if (j != 0) {
        rinfo += '","'
      }
      rinfo += rinfoA[j]
    }
    tinfo += rinfo + '"],\n'
  }
  tinfo += '];\n'
  tinfoF = $("textarea.tinfo")[0]
  tinfoF.value = tinfo
}

function deepCopyAA(aa) {
  var resultAA = []
  for (var i = 0; i < aa.length; i++) {
    resultAA[i] = aa[i].concat()
  }
  return resultAA
}



function compAA(sA, tA) {
  var a = sA[sortCol]
  var b = tA[sortCol]
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function showAA(aa) {
  var result = ""
  for (var i = 0; i < aa.length; i++) {
    // console.log(i, aa[i])
    result += aa[i][titleCol] + "\n"
  }
  tinfoF.value = result
}

function getRuleAA() {
  var resultAA = []
  var rule = $("div.rule")
  for (var i = 0; i < rule.length; i++) {
    var rl = rule[i];
    var r = rl.firstChild.value;
    var l = rl.lastChild.value;
    if (r) {
      resultAA[i] = [r, l]
    }
  }
  return resultAA
    // console.log(resutAA)
}

function applyRule(ruleA, aa) {
  var r = ruleA[0]
  var l = ruleA[1]
  if (r) {
    var pattern = new RegExp(r, "g")
    for (var i = 0; i < aa.length; i++) {
      var rinfoA = aa[i]
      rinfoA[titleCol] = rinfoA[titleCol].replace(pattern, l)
    }
  }
}

function outputRule() {
  var ruleJSONF = $("textarea.ruleJSON")[0]
  var ruleAA = getRuleAA()
  var ruleJSON = JSON.stringify(ruleAA)
  ruleJSONF.value = ruleJSON
}
