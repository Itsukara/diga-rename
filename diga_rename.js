//alert("Hello")
//document.frmVttlEdit.submit()

var titleF = document.querySelector("input[name='cVTE_TITLE']")
var topnoF = document.querySelector("input[name='VT_TOPNO']")
var noF = document.querySelector("input[name='VT_NO']")
var titleidF=document.querySelector("input[name='VT_TITLEID']")
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

  topnoF.value = no
  noF.value = no
  titleF.value = title
  titleidF.value = titleid

  document.frmVttlEdit.submit()
  
  i = i + 1
  if (i < tinfo.length) {
    setTimeout(digaRewrite, waitMS)
  } else {
    alert("録画タイトル書換え完了！")
  }
}









