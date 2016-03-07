// 【使い方】
//　 1.ChromeでDIGAにログイン。
//　 2.画面左側の番組編集ボタンを押して、番組名一覧を表示。
//　 3.画面下の「No.選択:」セレクタで、ダンプを開始したい画面を表示。
//　　（これを行わない場合は、先頭番組以降の全ての情報をダンプ)
//　 4.F12キーを押してChromeの「Developer Tools」を表示。
//　 5.diga-dump.jsの内容をコピーして、コンソールにペーストする。
//　　・ペーストしたJavascriptのコードが、表示されている画面以降の
//　　　全ての番組情報を自動的に表示・抽出し、ファイル「tinfo.txt」に保管。
//・途中で中止したい場合は、コンソールに下記を打ち込む。
//　digaGetTitlesStop()
//・途中で中止したのち、下記のように下記コマンドで再実行可能。
//　・digaGetTitlesStart()　　：表示画面以降の番組情報ををダンプ
//　・digaGetTitlesStart(s)　 ：s画面目以降の番組情報ををダンプ
//　・digaGetTitlesStart(s, e)：s画面目～(e-1)画面目の番組情報ををダンプ
//　※s画面目とは、「No.選択:」セレクの何番目かとうこと(0から始まる)

var rdoc     = rightframe.document
var roptions = rdoc.querySelectorAll('select option')
var selcur   = 0
var selstart = 0
var selend   = Math.min(roptions.length, 150)

var tinfo    = ""
var waitms   = 6000
var selno    = selstart
var stopflag = false

function digaGetTitles() {
  console.log("digaGetTitles:", selno, "(", roptions[selno].innerHTML, ")")
  digaExtractTitles()
  selno++
  if (selno <  selend && !stopflag) {
    digaShowTitles(selno)
    setTimeout(digaGetTitles, waitms)
  } else {
    digaPostProcessing()
    console.log("digaGetTitles: FINISHED")
  }
}

function digaExtractTitles() {
  console.log("digaExtractTitles:", selno, "(", roptions[selno].innerHTML, ")")
  var rdoc = rightframe.document
  var topno = rdoc.querySelector("input[name='VT_TOPNO']")
  if (!topno) {
    console.log("Right frame is wrong.\nPlease display title information in right frame.")
    return
  }
  var titleid = rdoc.querySelector("input[name='VT_TITLEID']").value.split(":")

  // 番組一覧表を取得
  var table = rdoc.querySelectorAll("table table")[2]
  var tbody = table.children[0]
  var rows = tbody.children

  var imin = 1
  // タイトル行は、後後の処理で邪魔なので、出力しないこととした。
  // if (selno == selstart) imin = 0

  for (var i = imin; i < rows.length; i++) {
    if (i != imin && titleid[i - 1] == "00000000") {
      break
    }

    var tds = rows[i].children
    var rinfo = ""
    var dinfo = ""
    for (var j = 1; j < tds.length; j++) {
      dinfo = tds[j].textContent;
      dinfo = dinfo.replace(/\n/g, "");
      if (j != 1) rinfo += "\t"
      rinfo += dinfo;
    }
    if (i == 0) {
      rinfo = rinfo + "\t" + "番組ID"
    } else {
      rinfo = rinfo + "\t" + titleid[i - 1]
    }
    tinfo += rinfo + "\n"
  }
}

function digaShowTitles(selno) {
  console.log("digaShowTitles:", selno, "(", roptions[selno].innerHTML, ")")

  var rselvalue = roptions[selno].value
  var rdoc      = rightframe.document
  var rform     = rdoc.querySelector('form')
  var rselect   = rdoc.querySelector('input[name=cCMD_VT_SELECT')
  var rlistno   = rdoc.querySelector('input[name=cCMD_VT_LISTNO')

  rselect.value = rselvalue
  rlistno.value = rselvalue
  rform.submit()
}

function digaDumpTitles() {
  console.log("digaDumpTitles:")
  var rdoc = rightframe.document

  // write tinfo to file
  var content = tinfo
  var date = new Date()
  var file_name = "tinfo" + "-" + date.toLocaleDateString() + "-" + date.toLocaleTimeString() + ".txt"
  file_name.replace(/\/:/g,"-") 
  var blob = new Blob([content], {
    type: "text/text"
  })
  var downloadLink = rdoc.createElement("a");

  downloadLink.href     = window.URL.createObjectURL(blob);
  downloadLink.download = file_name;
  downloadLink.target   = '_blank';

  var body = rdoc.querySelector("body")
  body.appendChild(downloadLink);
  downloadLink.click();
  body.removeChild(downloadLink);
}

function digaSaveTitles() {
  console.log("digaSaveTitles:")
  localStorage.digaDumpTinfo = tinfo
}

function digaGetTitlesStart(val, options, callback) {
  rdoc = rightframe.document
  if (!rdoc.querySelector("input[name='VT_TOPNO']")) {
    console.log("Right frame is wrong.\nPlease display title information in right frame.")
    return
  }

  roptions = rdoc.querySelectorAll('select option')
  selcur   = selChecked(roptions)
  selstart = selcur
  selend   = roptions.length

  var args = Array.prototype.slice.call(arguments, 0);
  switch(args.length) {
    case 0:
      break
    case 1:
      selstart = Math.max( parseInt(args[0]), 0)
      break
    case 2:
      selstart = Math.max(parseInt(args[0]), 0)
      selend   = Math.min(parseInt(args[1]), selend)
      break
	default:
	  console.log("Too many arguments!")
	  return
  }

  console.log("digaGetTitlesStart: selstart = ", selstart, ", selend =", selend)

  tinfo    = ""
  waitms   = 6000
  selno    = selstart
  stopflag = false

  if (selno != selcur) {
    digaShowTitles(selno)
    setTimeout(digaGetTitles, waitms)
  } else {
    digaGetTitles()
  }
}

function selChecked(roptions) {
  for (var i = 0; i < roptions.length; i++) {
    if (roptions[i].selected) {
      return i
    }
  }
  return 0
}

function digaPostProcessing() {
  digaDumpTitles()
  digaSaveTitles()
}


function digaGetTitlesStop() {
  stopflag = true
}

// Get titles from current screen to last screens
digaGetTitlesStart()

// Get all titles
//digaGetTitlesStart(0)

// Get titles from screen(s) to screen(e)-1
// digaGetTitlesStart(s, e)
