"use strict"

var usageF   = document.querySelector(".usage")

var tinfo         = ""
var tinfoF        = ""
var tinfoAA       = []
var resultTinfoAA = []
var colMax        = 7
var colOfNo       = 0
var colOfTitle    = 5
var colToSort     = colOfTitle;


window.onload = function() {
  if (localStorage.digaRuleJSON) {
    var ruleJSONF = $("textarea.ruleJSON")[0]
    ruleJSONF.value = localStorage.digaRuleJSON
    inputJSON()
  }
}

function sortTinfo() {
  tinfoAA   = getTinfoAA()
  colToSort = colOfTitle
  tinfoAA.sort(compAA)
  showAA(tinfoAA)
}

function inputJSON() {
  var ruleJSONF = $("textarea.ruleJSON")[0]
  var ruleJSON  = ruleJSONF.value
  if (ruleJSON == "") {
    return
  }
  var ruleAA = JSON.parse(ruleJSON)

  var rule = $("div.rule")
  if (ruleAA.length > rule.length) {
    console.log("JSON include too many rules!")
  }

  for (var i = 0; i < rule.length; i++) {
    var ruleA = ruleAA[i]
    var ruleinfo = rule[i].children;
    ruleinfo[0].value   = "";
    ruleinfo[1].checked = false;
    ruleinfo[2].value   = "";
    if (ruleA) {
      var r          = ruleA[0]
      var regexpflag = ruleA[1]
      var l          = ruleA[2]
      if (r) {
        ruleinfo[0].value   = r;
        ruleinfo[1].checked = regexpflag;
        ruleinfo[2].value   = l;
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
  tinfoF = $("textarea.tinfo")[0]
  var tinfo  = tinfoF.value
  var tinfoA = tinfo.split("\n")
  var numRinfo = 0
  for (var i = 0; i < tinfoA.length; i++) {
    var rinfo = tinfoA[i]
    rinfo = rinfo.replace(/^[\s\t]+/, "")
    var rinfoA = rinfo.split("\t")
    if (rinfoA.length != colMax) {
      console.log("line(" + i + ") length != 7 :", rinfoA)
      continue
    }
    resultAA[numRinfo++] = rinfoA
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
  var tinfo = "";
  for (var i = 0; i < resultTinfoAA.length; i++) {
    if (equalA(tinfoAA[i], resultTinfoAA[i])) {
      continue
    }
    var rinfoA = resultTinfoAA[i]
    outputAA.push(rinfoA)
    var rinfo = ""
    for (var j = 0; j < rinfoA.length; j++) {
      if (j != 0) {
        rinfo += '\t'
      }
      rinfo += rinfoA[j]
    }
    tinfo += rinfo + '\n'
  }
  tinfoF = $("textarea.tinfo")[0]
  tinfoF.value = tinfo

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
    // console.log(i, aa[i])
    result += aa[i][colOfTitle] + "\n"
  }
  tinfoF.value = result
}

function getRuleAA() {
  var resultAA = []
  var rules = $("div.rule")
  for (var i = 0; i < rules.length; i++) {
    var ruleinfo   = rules[i].children;
    var r          = ruleinfo[0].value;
    var regexpflag = ruleinfo[1].checked;
    var l          = ruleinfo[2].value;
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
  var ruleJSONF = $("textarea.ruleJSON")[0]
  var ruleAA = getRuleAA()
  var ruleJSON = JSON.stringify(ruleAA)
  ruleJSONF.value = ruleJSON

  localStorage.digaRuleJSON = ruleJSON
}
