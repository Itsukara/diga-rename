var titleF   = document.querySelector("input[name='cVTE_TITLE']")
var topnoF   = document.querySelector("input[name='VT_TOPNO']")
var noF      = document.querySelector("input[name='VT_NO']")
var titleidF = document.querySelector("input[name='VT_TITLEID']")

var waitsecF  = document.querySelector("input[name='waitsec']")
var numrwF   = document.querySelector("input[name='numrewrite']")
var currwF   = document.querySelector("input[name='currewrite']")
var rwinfoF  = document.querySelector("input[name='rewriteinfo']")
var tinfoF   = document.querySelector(".tinfo")
var rmaintF  = document.querySelector("input[name='remaintime']")
var tinfoAA  = null
var tinfo    = null

var colOfNo      = 0
var colOfTitle   = 5
var colOfTitleID = 6

var stopflag     = false

// 下記により、1番組ごとに、DIGAの処理完了を8000ミリ秒(8秒)待つ。
// 下記でうまくいかない場合は、値を増やしてください。
// なお、LAN録画中は、ネット経由の番組名変更ができません。
var waitms = 8000
var currow = 0

window.onload = function() {
  if (localStorage.digaTinfo) {
    tinfo = localStorage.digaTinfo
    tinfoF.value = tinfo
  } else {
    alert("Title information in localStorage is null!")
  }

  if (localStorage.digaTinfoAA) {
    tinfoAA = JSON.parse(localStorage.digaTinfoAA)
    numrwF.value = tinfoAA.length
  } else {
    alert("Title information in localStorage is null!")
  }

  waitsecF.value = waitms / 1000
  updateRaminTime()
}

function updateRaminTime() {
  var waitsec = parseInt(waitsecF.value)
  waitms = waitsec * 1000
  rmaintF.value = ((tinfoAA.length - currow) * waitms/1000) + "秒"
}

function digaRewriteStart() {
  currow = 0
  stopflag = false
  updateRaminTime()
  digaRewrite()
}

function digaRwriteStop() {
  stopflag = true
}

function digaRewrite() {
  if (tinfoAA == null) {
    alert("Title information in localStorage is null!")
    return
  }
  if (stopflag) {
    rwinfoF.value = "Stoped!!"
    currow = 0
    return
  }
  var rinfoA = tinfoAA[currow]
  var no = rinfoA[colOfNo] - 1
  var title = rinfoA[colOfTitle]
  var titleid = rinfoA[colOfTitleID]

  if (!rinfoA ||
    !no ||
    no < 0 ||
    no > 3000 ||
    !title ||
    !titleid) {
    return false
  }

  rwinfoF.value = rinfoA.join(" ")
  currwF.value = currow + 1
  updateRaminTime()

  topnoF.value = no
  noF.value = no
  titleF.value = title
  titleidF.value = titleid

  document.frmVttlEdit.submit()

  currow = currow + 1
  if (currow < tinfoAA.length) {
    setTimeout(digaRewrite, waitms)
  } else {
    setTimeout(function() {
      rwinfoF.value = "DIGA Title rewritning has finished!"
    }, waitms)
  }
}
