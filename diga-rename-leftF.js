"use strict"

function errorAlert(msg) {
  alert(msg)
  throw msg
}

function $one(sel) {
  var r = document.querySelector(sel)
  if (!r) {
    errorAlert('ERROR: document.querySelector("' + sel + '") is null')
  }
  return r
}

// DIGAにPOSTするためのform Node
var digaformNode = $one("form[name='frmVttlEdit']")
var titleNode    = $one("input[name='cVTE_TITLE']")
var topnoNode    = $one("input[name='VT_TOPNO']")
var noNode       = $one("input[name='VT_NO']")
var titleidNode  = $one("input[name='VT_TITLEID']")

// 画面上での情報表示Node
var digaIPNode     = $one("input[name='digaIP']")
var waitsecNode    = $one("input[name='waitsec']")
var numrewriteNode = $one("input[name='numrewrite']")
var currewriteNode = $one("input[name='currewrite']")
var tinfoNode      = $one("ul[name='tinfo']")
var remaintimeNode = $one("input[name='remaintime']")

// 「画面上での各番組情報のLi Node」を配列で保持 
var tinfoLiNodeA = []

// 番組情報(Array of Array形式)
var tinfoAA  = null

// tinfoAA中での各情報の欄(NO, TITLE, TITLEID)の番号
var colOfNo      = 0
var colOfTitle   = 5
var colOfTitleID = 6

// 書換え中止フラグ
var stopflag     = false

// DIGA MANAGERの画面を右のフレームに表示(htmlのイベント処理関数)
function connectDIGA() {
  var digaIP = digaIPNode.value
  if (!digaIP) {
    errorAlert("DIGAのIPアドレスが未設定です。")
  }
  digaformNode.action = "http://" + digaIP + "/cgi-bin/vttl_edit.cgi"
  parent.rightF.location.replace("http://" + digaIP)
  localStorage.digaIP = digaIP
}

// 1番組毎のDIGAの処理完了待ち時間(8000ミリ秒(8秒))。
// 下記でうまくいかない場合は、GUI上で値を増やしてください。
// なお、LAN録画中は、ネット経由の番組名変更ができません。
var waitms = 8000

// 書換え中の番組の(tinfoAA中での行番号)
var currentTitleIndex = 0

// 画面初期表示時の処理
window.onload = function() {
  if (localStorage.digaIP) {
    var digaIP = localStorage.digaIP
    digaIPNode.value = digaIP
  }

  if (localStorage.digaTinfoAA) {
    tinfoAA = JSON.parse(localStorage.digaTinfoAA)
    numrewriteNode.value = tinfoAA.length
  } else {
    errorAlert("localStorage上に番組情報が無い。")
  }
  
  showTinfo()

  waitsecNode.value = waitms / 1000
  updateRaminTime()
}

// 番組情報を表示
function showTinfo() {
  tinfoLiNodeA = []
  for (var i = 0; i < tinfoAA.length; i++) {
    var linode = document.createElement("li")
    linode.innerHTML = tinfoAA[i].slice(0,-1).join(" ")
    tinfoNode.appendChild(linode)
    tinfoLiNodeA[i] = linode
  }
}

// 番組情報中でのi番目の番組の文字色を変更
function setTinfoColor(i, color) {
  var li = tinfoLiNodeA[i]
  li.style = "color: " + color
}

// 番組情報中での全ての番組の文字色を変更
function resetTinfoColor(color) {
  for (var i = 0; i < tinfoLiNodeA.length; i++) {
    var li = tinfoLiNodeA[i]
    li.style = "color: " + color
  }
}

// 残り時間(秒)の表示を更新
function updateRaminTime() {
  var waitsec = parseInt(waitsecNode.value)
  if (!waitsec || waitsec < 1 || waitsec > 10) {
    errorAlert("DIGA待ち時間(秒)が不適切です。1～10の値を設定してください。")
  }
  waitms = waitsec * 1000
  remaintimeNode.value = ((tinfoAA.length - currentTitleIndex) * waitms/1000)
}

// DIGAの番組情報変更を開始(htmlのイベント処理関数)
function digaRewriteStart() {
  updateRaminTime()
  currentTitleIndex = 0
  stopflag = false
  resetTinfoColor("black")
  updateRaminTime()
  digaRewrite()
}

// IGAの番組情報変更を中止(htmlのイベント処理関数)
function digaRwriteStop() {
  stopflag = true
}

// DIGAの番組情報を変更
function digaRewrite() {
  if (tinfoAA == null) {
    errorAlert("内部エラー：番組情報が空")
  }
  if (stopflag) {
    alert("番組名変更を中止しました。")
    currentTitleIndex = 0
    return
  }
  var rinfoA = tinfoAA[currentTitleIndex]
  var no = rinfoA[colOfNo] - 1
  var title = rinfoA[colOfTitle]
  var titleid = rinfoA[colOfTitleID]

  if (!rinfoA || !no || no < 0 || no > 3000 || !title || !titleid) {
    return false
  }

  // 画面上の情報を更新
  if (currentTitleIndex > 0) {
    setTinfoColor(currentTitleIndex - 1, "black")
  }
  setTinfoColor(currentTitleIndex, "red")

  currewriteNode.value = currentTitleIndex
  
  updateRaminTime()

  // DIGAに番組名変更え指示を出す
  topnoNode.value = no
  noNode.value = no
  titleNode.value = title
  titleidNode.value = titleid

  document.frmVttlEdit.submit()

  // 次の番組の処理
  currentTitleIndex = currentTitleIndex + 1
  if (currentTitleIndex < tinfoAA.length) {
    setTimeout(digaRewrite, waitms)
  } else {
    setTimeout(function() {
      resetTinfoColor("blue")
      alert("番組名変更が完了しました。")
      currewriteNode.value = currentTitleIndex
      updateRaminTime()
    }, waitms)
  }
}
