"use strict"

function errorAlert(msg) {
  alert(msg)
  throw msg
}

function $one(sel) {
  var r = document.querySelector(sel)
  if (!r) {
//    console.log('ERROR: document.querySelector("' + sel + '") == null')
//    errorAlert("DIGAにログインし番組編集画面を表示してください。")
    errorAlert('ERROR: document.querySelector("' + sel + '") == null')
  }
  return r
}

function $all(sel) {
  var r = document.querySelectorAll(sel)
  if (!r || r.length == 0) {
//    console.log('ERROR: document.querySelectorAll("' + sel + '") == []')
//    errorAlert("DIGAにログインし番組編集画面を表示してください。")
    errorAlert('ERROR: document.querySelectorAll("' + sel + '") == []')
  }
  return r
}

// 画面上での情報表示Node
var usageNode     = $one(".usage")
var ruleJSONNode  = $one("textarea.ruleJSON")
var tinfoNode     = $one("textarea.tinfo")
var ruleListNode  = $one("div.ruleList")

// 番組情報(Array of Array形式)
var tinfoAA       = []

// 変更後の番組情報(Array of Array形式)
var resultTinfoAA = []

// tinfoAA中の要素配列の長さ、欄(NO, TITLE)の番号
var colMax        = 7
var colOfNo       = 0
var colOfTitle    = 5

// tinfoAの比較関数
var compTinfoAbyNo    = compTinfoA.bind(null, colOfNo)
var compTinfoAbyTitle = compTinfoA.bind(null, colOfTitle)

// 書換え規則の数の初期値
var ruleInitNum   = 30

// 書換え規則の最後に予備で追加する規則の数
var ruleAddNum    = 5

// 画面初期表示時の処理
window.onload = function() {
  if (localStorage.digaRuleJSON) {
    ruleJSONNode.value = localStorage.digaRuleJSON
    inputRuleJSON()
  }
}

// 番組情報のソート、表示(番組名をキーとしてソート)
function sortTinfo() {
  tinfoAA   = getTinfoAA()
  tinfoAA.sort(compTinfoAbyTitle)
  showAA(tinfoAA)
}

// 書換え規則(JSON)の入力、画面上の書換え規則への反映
function inputRuleJSON() {
  // 画面上の書換え規則の数をruleInitNumまで増加
  increaseRules(ruleInitNum)

  var ruleJSON  = ruleJSONNode.value
  if (!ruleJSON) {
    initRules()
    return
  }
  var ruleAA = JSON.parse(ruleJSON)

  increaseRules(ruleAA.length + ruleAddNum)
  initRules()
  showRules(ruleAA)
}

// 画面上の書換え規則の数をn個まで増加(減らす処理は未実装)
function increaseRules(n) {
  var ruleNodeA     = $all("div.rule")
  var ruleTemplate  = ruleNodeA[0]
  for (var i = ruleNodeA.length; i < n; i++) {
    var newRuleNode = ruleTemplate.cloneNode(true)
    ruleListNode.appendChild(newRuleNode)
  }
}

// 画面上の書換え規則を初期化
function initRules() {
  var ruleNodeA    = $all("div.rule")
  for (var i = 0; i < ruleNodeA.length; i++) {
    var ruleChildren = ruleNodeA[i].children;
    ruleChildren[0].value   = "";
    ruleChildren[1].checked = false;
    ruleChildren[2].value   = "";
  }
}

// 書換え規則を画面上に反映
function showRules(ruleAA) {
  var ruleNodeA = $all("div.rule")
  for (var i = 0; i < ruleAA.length; i++) {
    var ruleA = ruleAA[i]
    if (ruleA && ruleA[0]) {
      var r          = ruleA[0]
      var regexpflag = ruleA[1]
      var l          = ruleA[2]

      var ruleChildren = ruleNodeA[i].children;
      ruleChildren[0].value   = r;
      ruleChildren[1].checked = regexpflag;
      ruleChildren[2].value   = l;
    }
  }
}

// 書換え規則を順に番組情報に適用し、表示
function renameTinfo() {
  var ruleAA = getRuleAA()
  var resultAA = deepCopyAA(tinfoAA)
  for (var i = 0; i < ruleAA.length; i++) {
    var ruleA = ruleAA[i]
    if (ruleA) {
      applyRule(ruleA, resultAA)
    }
  }
  resultAA.sort(compTinfoAbyTitle)
  showAA(resultAA)
  resultTinfoAA = resultAA
}

// 書換え規則と変更後の番組情報を出力
function outputTinfoAndRule() {
  outputRule();
  outputTinfo();
  alert("書換え規則と番組情報をブラウザのlocalStorageに保管しました。")
}

// 画面上の番組情報を取り込み
function getTinfoAA() {
  var resultAA = []
  var tinfo  = tinfoNode.value

  if (!tinfo) {
    errorAlert("番組情報が空です。")
  }
  tinfo = tinfo.replace(/^\s*/, "")
  tinfo = tinfo.replace(/\s*$/, "") 

  var tinfoA = tinfo.split("\n")
  for (var i = 0; i < tinfoA.length; i++) {
    var rinfo = tinfoA[i]
    rinfo = rinfo.replace(/^\s*/, "")
    rinfo = rinfo.replace(/\s*$/, "")
    var rinfoA = rinfo.split("\t")
    if (rinfoA.length != colMax) {
      errorAlert((i+1) + "行目の項目数が不正")
    }
    var no = parseInt(rinfoA[0])
    if (!no || no < 1 || no > 3000) {
      errorAlert((i+1) + "行目の番組情報の形式が誤っています。")
    }

    resultAA.push(rinfoA)
  }

  return resultAA
}

// ２つの配列の中身が等しいか判定
function equalA(aA, bA) {
  if (aA.length != bA.length) {
    return false
  }
  for (var i = 0; i < aA.length; i++) {
    if (aA[i] != bA[i]) {
      return false
    }
  }
  return true
}

// 書換え後の番組情報(変更された部分のみ)を画面とブラウザのlocalStorageに出力
function outputTinfo() {
  var outputAA = []

  // 書換え前と後の番組情報を番組のNoでソート
  tinfoAA.sort(compTinfoAbyNo)
  resultTinfoAA.sort(compTinfoAbyNo)

  // 変更された部分のみを抽出
  for (var i = 0; i < resultTinfoAA.length; i++) {
    if (equalA(tinfoAA[i], resultTinfoAA[i])) {
      continue
    }
    outputAA.push(resultTinfoAA[i])
  }

  // 変更後の番組情報をtext形式に変換
  var tinfo = "";
  for (var i = 0; i < outputAA.length; i++) {
    var rinfo = outputAA[i].join("\t") + "\n"
    tinfo += rinfo
  }

  tinfoNode.value = tinfo
  localStorage.digaTinfo = tinfo
  localStorage.digaTinfoAA = JSON.stringify(outputAA)
}

// Array of Array型のdeepCopy
function deepCopyAA(aa) {
  return JSON.parse(JSON.stringify(aa))
}

// tinfoAどうしの比較をする関数(比較のキーとなる欄はcolToSort)
function compTinfoA(colToSort, tinfoA1, tinfoA2) {
  var v1 = tinfoA1[colToSort]
  var v2 = tinfoA2[colToSort]

  if (v1 < v2) return -1
  if (v1 > v2) return 1
  return 0
}

// 番組情報のタイトル部分のみを表示
function showAA(tinfoAA) {
  var result = ""

  for (var i = 0; i < tinfoAA.length; i++) {
    result += tinfoAA[i][colOfTitle] + "\n"
  }

  tinfoNode.value = result
}

// 画面上の書換え規則をプログラム中に取り込み
function getRuleAA() {
  var resultAA = []
  var ruleNodeA = $all("div.rule")

  for (var i = 0; i < ruleNodeA.length; i++) {
    var ruleChildren = ruleNodeA[i].children;
    var r          = ruleChildren[0].value;
    var regexpflag = ruleChildren[1].checked;
    var l          = ruleChildren[2].value;
    if (r) {
      // resultAA.push()は意図的に使わない
      // (書換え規則未記載の部分を次回利用時に再現するため)
      resultAA[i] = [r, regexpflag, l]
    }
  }

  return resultAA
}

// 書換え規則を番組情報(Array of Array形式)に適用
function applyRule(ruleA, tinfoAA) {
  var r          = ruleA[0]
  var regexpflag = ruleA[1]
  var l          = ruleA[2]

  if (r) {
  	if (regexpflag) {
      r = new RegExp(r)
    }
    for (var i = 0; i < tinfoAA.length; i++) {
      var rinfoA = tinfoAA[i]
      rinfoA[colOfTitle] = rinfoA[colOfTitle].replace(r, l)
    }
  }
}

// 書換え規則をJSON化して画面表示、ブラウザのlocalStorageに保管
function outputRule() {
  var ruleAA = getRuleAA()
  var ruleJSON = JSON.stringify(ruleAA)

  ruleJSONNode.value = ruleJSON
  localStorage.digaRuleJSON = ruleJSON
}
