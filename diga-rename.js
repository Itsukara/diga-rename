var binfoF = document.querySelector("input[name='BINFO']")
var titleF = document.querySelector("input[name='cVTE_TITLE']")
var topnoF = document.querySelector("input[name='VT_TOPNO']")
var noF = document.querySelector("input[name='VT_NO']")
var titleidF = document.querySelector("input[name='VT_TITLEID']")

// 下記により、1番組ごとに、DIGAの処理完了を8000ミリ秒(8秒)待つ。
// 下記でうまくいかない場合は、値を増やしてください。
// なお、LAN録画中は、ネット経由の番組名変更ができません。
var waitMS = 8000

var i = 1

function digaRewrite() {
  var rinfo = tinfo[i]
  var no = rinfo[0] - 1
  var title = rinfo[5]
  var titleid = rinfo[6]

  if (rinfo == null ||
    no == null ||
    no < 0 ||
    no > 3000 ||
    title == null ||
    titleid == null) {
    return false
  }

  binfoF.value = rinfo.join(" ")
  topnoF.value = no
  noF.value = no
  titleF.value = title
  titleidF.value = titleid

  document.frmVttlEdit.submit()

  i = i + 1
  if (i < tinfo.length) {
    setTimeout(digaRewrite, waitMS)
  } else {
    binfoF.value = "番組名書換え完了！"
  }
}
