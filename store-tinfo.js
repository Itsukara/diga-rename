"use strict"

function errorAlert(msg) {
  alert(msg)
  throw new Error(msg)
}

function $one(sel) {
  var r = document.querySelector(sel)
  if (!r) {
    errorAlert('ERROR: document.querySelector("' + sel + '") == null')
  }
  return r
}

function $all(sel) {
  var r = document.querySelectorAll(sel)
  if (!r || r.length == 0) {
    errorAlert('ERROR: document.querySelectorAll("' + sel + '") == []')
  }
  return r
}

// 画面上での情報表示Node
var tinfoNode     = $one("textarea.tinfo")

// 番組情報(Array of Array形式)
var tinfoAA       = []

// tinfoAA中の要素配列の長さ、欄(NO, TITLE)の番号
var colMax        = 7
var colOfNo       = 0
var colOfTitle    = 5

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


// 番組情報をブラウザのlocalStorageに出力
function outputTinfo() {
  var outputAA   = getTinfoAA()
  localStorage.digaTinfoAA = JSON.stringify(outputAA)
  alert("番組情報をブラウザのlocalStorageに保管しました。")
}

