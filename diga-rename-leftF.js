function $1(sel) {
  var r = document.querySelector(sel)
  if (!r) {
    console.log("ERROR: result of querySelector(" + sel + "is null")
  }
  return r
}

var titleF   = $1("input[name='cVTE_TITLE']")
var topnoF   = $1("input[name='VT_TOPNO']")
var noF      = $1("input[name='VT_NO']")
var titleidF = $1("input[name='VT_TITLEID']")

var digaformF= $1("form[name='frmVttlEdit']")
var digaIPF  = $1("input[name='digaIP']")
var waitsecF = $1("input[name='waitsec']")
var numrwF   = $1("input[name='numrewrite']")
var currwF   = $1("input[name='currewrite']")
var rwinfoF  = $1("input[name='rewriteinfo']")
var tinfoF   = $1(".tinfo")
var rmaintF  = $1("input[name='remaintime']")
var digIP    = null
var tinfoAA  = null
var tinfo    = null

var colOfNo      = 0
var colOfTitle   = 5
var colOfTitleID = 6

var stopflag     = false

function connectDIGA() {
  var digaIP = digaIPF.value
  if (!digaIP) {
    alert("Input DIGA IP Address at first")
    return
  }
  digaformF.action = "http://" + digaIP + "/cgi-bin/vttl_edit.cgi"
  parent.rightF.location.replace("http://" + digaIP)
  localStorage.digaIP = digaIP
}


// 下記により、1番組ごとに、DIGAの処理完了を8000ミリ秒(8秒)待つ。
// 下記でうまくいかない場合は、値を増やしてください。
// なお、LAN録画中は、ネット経由の番組名変更ができません。
var waitms = 8000
var currow = 0

window.onload = function() {
  if (localStorage.digaIP) {
    digaIP = localStorage.digaIP
    digaIPF.value = digaIP
  }

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
  rmaintF.value = ((tinfoAA.length - currow) * waitms/1000)
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
    rwinfoF.value = "Stopped!!"
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
  currwF.value = currow
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
      currwF.value = currow
      updateRaminTime()
    }, waitms)
  }
}
