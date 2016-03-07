"use strict"

function $1(sel) {
  var r = document.querySelector(sel)
  if (!r) {
    alert.log("ERROR: result of querySelector(" + sel + "is null")
  }
  return r
}

function $all(sel) {
  var r = document.querySelectorAll(sel)
  if (r == []) {
    alert.log("ERROR: result of querySelectorAll(" + sel + "is []")
  }
  return r
}

var usageNode     = $1(".usage")
var ruleJSONNode  = $1("textarea.ruleJSON")
var tinfoNode     = $1("textarea.tinfo")

var tinfoAA       = []
var resultTinfoAA = []
var colMax        = 7
var colOfNo       = 0
var colOfTitle    = 5
var colToSort     = colOfTitle;
var ruleAddNum    = 5

window.onload = function() {
  if (localStorage.digaRuleJSON) {
    ruleJSONNode.value = localStorage.digaRuleJSON
    inputRuleJSON()
  }
}

function sortTinfo() {
  tinfoAA   = getTinfoAA()
  colToSort = colOfTitle
  tinfoAA.sort(compAA)
  showAA(tinfoAA)
}

function inputRuleJSON() {
  var ruleJSON  = ruleJSONNode.value
  if (ruleJSON == "") {
    return
  }
  var ruleAA = JSON.parse(ruleJSON)

  var ruleListNode = $1("div.ruleList")
  var ruleNodeA    = $all("div.rule")
  var ruleTemplate   = ruleNodeA[0]
  for (var i = ruleNodeA.length; i < ruleAA.length + ruleAddNum; i++) {
    var newRuleNode = ruleTemplate.cloneNode(true)
    ruleListNode.appendChild(newRuleNode)
  }

  var ruleNodeA    = $all("div.rule")

  for (var i = 0; i < ruleNodeA.length; i++) {
    var ruleChildren = ruleNodeA[i].children;
    ruleChildren[0].value   = "";
    ruleChildren[1].checked = false;
    ruleChildren[2].value   = "";
  }

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

function renameTinfo() {
  var ruleAA = getRuleAA()
  var resultAA = deepCopyAA(tinfoAA)
  for (var i = 0; i < ruleAA.length; i++) {
    var ruleA = ruleAA[i]
    if (ruleA) {
      applyRule(ruleA, resultAA)
    }
  }
  colToSort = colOfTitle
  resultAA.sort(compAA)
  showAA(resultAA)
  resultTinfoAA = resultAA
}

function outputTinfoAndRule() {
  outputTinfo();
  outputRule();
  alert("Title information and rewrite rules are saved in localStorage.")
}

function getTinfoAA() {
  var resultAA = []
  var tinfo  = tinfoNode.value
  var tinfoA = tinfo.split("\n")
  for (var i = 0; i < tinfoA.length; i++) {
    var rinfo = tinfoA[i]
    rinfo = rinfo.replace(/^[\s\t]+/, "")
    var rinfoA = rinfo.split("\t")
    if (rinfoA.length != colMax) {
      console.log("line(" + i + ") length != 7 :", rinfoA)
      continue
    }
    resultAA.push(rinfoA)
  }
  return resultAA
  // console.log(resultAA)
}

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

function outputTinfo() {
  colToSort = colOfNo
  tinfoAA.sort(compAA)
  resultTinfoAA.sort(compAA)

  var outputAA = []
  for (var i = 0; i < resultTinfoAA.length; i++) {
    if (equalA(tinfoAA[i], resultTinfoAA[i])) {
      continue
    }
    var rinfoA = resultTinfoAA[i]
    outputAA.push(rinfoA)
  }

  var tinfo = "";
  for (var i = 0; i < outputAA.length; i++) {
    var rinfo = ""
    var rinfoA = outputAA[i]
    for (var j = 0; j < rinfoA.length; j++) {
      if (j != 0) {
        rinfo += '\t'
      }
      rinfo += rinfoA[j]
    }
    tinfo += rinfo + '\n'
  }
  tinfoNode.value = tinfo

  localStorage.digaTinfo = tinfo
  localStorage.digaTinfoAA = JSON.stringify(outputAA)
}

function deepCopyAA(aa) {
  var resultAA = []
  for (var i = 0; i < aa.length; i++) {
    resultAA[i] = aa[i].concat()
  }
  return resultAA
}

function compAA(sA, tA) {
  var a = sA[colToSort]
  var b = tA[colToSort]
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function showAA(aa) {
  var result = ""
  for (var i = 0; i < aa.length; i++) {
    result += aa[i][colOfTitle] + "\n"
  }
  tinfoNode.value = result
}

function getRuleAA() {
  var resultAA = []
  var ruleNodeA = $all("div.rule")
  for (var i = 0; i < ruleNodeA.length; i++) {
    var ruleChildren = ruleNodeA[i].children;
    var r          = ruleChildren[0].value;
    var regexpflag = ruleChildren[1].checked;
    var l          = ruleChildren[2].value;
    if (r) {
      resultAA[i] = [r, regexpflag, l]
    }
  }
  return resultAA
    // console.log(resutAA)
}

function applyRule(ruleA, aa) {
  var r          = ruleA[0]
  var regexpflag = ruleA[1]
  var l          = ruleA[2]
  if (r) {
  	if (regexpflag) {
      r = new RegExp(r)
    }
    for (var i = 0; i < aa.length; i++) {
      var rinfoA = aa[i]
      rinfoA[colOfTitle] = rinfoA[colOfTitle].replace(r, l)
    }
  }
}

function outputRule() {
  var ruleAA = getRuleAA()
  var ruleJSON = JSON.stringify(ruleAA)

  ruleJSONNode.value = ruleJSON

  localStorage.digaRuleJSON = ruleJSON
}
