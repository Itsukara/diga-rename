// 【使い方】
//　 0.DIGAの電源を入れる。(電源を入れないと直ぐに接続が切れるため)
//　 1.ChromeでDIGAにログイン。
//　 2.画面左側の番組編集ボタンを押して、番組名一覧を表示。
//　 3.画面下の「No.選択:」セレクタで、ダンプを開始したい画面を表示。
//　　（これを行わない場合は、先頭番組以降の全ての情報をダンプ)
//　 4.F12キーを押してChromeの「Developer Tools」を表示。
//　 5.画面左下のConsoleの下にあるセレクタで"top"を選択。
//　 6.diga-dump.jsの内容をコピーして、コンソールにペーストする。
//　　・ペーストしたJavascriptのコードが、表示されている画面以降の
//　　　全ての番組情報を自動的に表示・抽出し、ファイル「tinfo.txt」に保管。
//・途中で中止したい場合は、コンソールに下記を打ち込む。
//　digaGetTitlesStop()
//・途中で中止したのち、下記のように下記コマンドで再実行可能。
//　・digaGetTitlesStart()　　：表示画面以降の番組情報ををダンプ
//　・digaGetTitlesStart(s)　 ：s画面目以降の番組情報ををダンプ
//　・digaGetTitlesStart(s, e)：s画面目～(e-1)画面目の番組情報ををダンプ
//　※s画面目とは、「No.選択:」セレクの何番目かとうこと(0から始まる)
//・このコードをDeveloper ToolsのSnippetsに登録しておくと便利です。
//　一度登録すると、登録したSinppets名の上で右クリックしてRunを選択するだけで実行可能です。
//　登録方法は下記です。
//　- Developer Toolsの上部にあるメニューでSoucesを選ぶ。
//　- 画面左上のSnippetsを選ぶ。
//　- Snippetsの下の部分で右クリックして表示されるNewを選択する。
//　- 新規Snippets名を記載する(例えばdiga-dump)。
//　- Snippets名の右側の真っ白な広い欄に本コードをペーストする。
//　- ペーストした欄の上を見るとSnippet名が表示されているので、
//　　このSnippet名で右クリックして、saveを選択してコードを保管する。

"use strict"

function errorAlert(msg) {
  alert(msg)
  throw new Error(msg)
}

function $rone(sel) {
  var rdoc = typeof rightframe !== "undefined" && rightframe.document
  var r = rdoc && rdoc.querySelector(sel)
  if (!r) {
    console.log('ERROR: document.querySelector("' + sel + '") == null')
    errorAlert("DIGAにログインし番組編集画面を表示してください。")
  }
  return r
}

function $rall(sel) {
  var rdoc = typeof rightframe !== "undefined" && rightframe.document
  var r = rdoc && rdoc.querySelectorAll(sel)
  if (!r || r.length == 0) {
    console.log('ERROR: document.querySelectorAll("' + sel + '") == []')
    errorAlert("DIGAにログインし番組編集画面を表示してください。")
  }
  return r
}

// 「No.選択:」セレクタのoption Nodeの配列
var selectOptionNodeA = $rall("select option")

// selectOptionNodeAでのインデックス(先頭、最後、表示中、処理中)
var selstart = 0
var selend   = selectOptionNodeA.length
var selcur   = selChecked(selectOptionNodeA)
var selno    = selcur

// 番組情報
var tinfo    = ""

// 「No.選択:」セレクタ変更後のDIGAに対する待ち時間
var waitms   = 6000

// 処理中止フラグ
var stopflag = false

// メイン関数（表示中の番組情報取得、次の番組情報表示、終了処理）
function digaGetTitles() {
  selectOptionNodeA = $rall("select option")
  console.log("digaGetTitles:", selno, "(", selectOptionNodeA[selno].innerHTML, ")")
  
  digaExtractTitles()
  selno++
  if (selno <  selend && !stopflag) {
    digaShowTitles(selno)
    setTimeout(digaGetTitles, waitms)
  } else {
    digaPostProcessing()
    console.log("番組情報の取得が終了しました。")
  }
}

// 表示中の画面から番組情報を抽出
function digaExtractTitles() {
//  selectOptionNodeA = $rall("select option")
//  console.log("digaExtractTitles:", selno, "(", selectOptionNodeA[selno].innerHTML, ")")

  // 番組一覧表を取得
//  var titleTableNode = $rall("table table")[2]
//  var tbodyNode = titleTableNode.children[0]
  var tbodyNode = $rall("tbody")[4]
  var titleNodeA = tbodyNode.children
  var titleid = $rone("input[name='VT_TITLEID']").value.split(":")

  // タイトル行はスキップする(i = 1)。
  for (var i = 1; i < titleNodeA.length; i++) {
    // 未録画部分(titleidが"00000000")は処理しない
    if (titleid[i - 1] == "00000000") break

    var rinfo = ""
    var tdNodeA = titleNodeA[i].children
    // 先頭のチェックボックスはスキップする(j = 1)。
    for (var j = 1; j < tdNodeA.length; j++) {
      var dinfo = tdNodeA[j].textContent;
      // 番組番号(No.)は改行が入るため、クリーンアップ
      dinfo = dinfo.replace(/\n/g, "");
      rinfo += dinfo + "\t";
    }
    
    // 最後に番組IDを付加
    rinfo += titleid[i - 1] + "\n"
    
    tinfo += rinfo
  }
}

// 表示中番組情報を切り替え
function digaShowTitles(selno) {
  selectOptionNodeA = $rall("select option")
  console.log("digaShowTitles:", selno, "(", selectOptionNodeA[selno].innerHTML, ")")

  var selvalue     = selectOptionNodeA[selno].value
  var digaformNode = $rone('form')
  var selectNode   = $rone('input[name=cCMD_VT_SELECT]')
  var listnoNode   = $rone('input[name=cCMD_VT_LISTNO]')

  selectNode.value = selvalue
  listnoNode.value = selvalue
  digaformNode.submit()
}

function digaDumpTitles() {
  console.log("digaDumpTitles:")
  var date = new Date()
  var file_name = "tinfo" + "-" + date.toLocaleDateString() + "-" + date.toLocaleTimeString() + ".txt"
  file_name.replace(/\/:/g,"-") 

 dump_to_file(file_name, tinfo, rightframe.document)
}

function dump_to_file(file_name, content, document) {
  var blob = new Blob([content], {
    type: "text/text"
  })
  var downloadLink = document.createElement("a");
  downloadLink.href     = window.URL.createObjectURL(blob);
  downloadLink.download = file_name;
  downloadLink.target   = '_blank';
  var body = document.querySelector("body")
  body.appendChild(downloadLink);
  downloadLink.click();
  body.removeChild(downloadLink);
}

function digaSaveTitles() {
  console.log("digaSaveTitles:")
  localStorage.digaDumpTinfo = tinfo
}

function digaGetTitlesStart(start, end, ms) {
  selectOptionNodeA = $rall("select option")
  selcur   = selChecked(selectOptionNodeA)

  // デフォルト設定
  selstart = selcur
  selend   = selectOptionNodeA.length
  waitms   = 6000

  // 引数で指定された場合
  if (start !== undefined) selstart = Math.max(start, 0)
  if (end   !== undefined) selend   = Math.min(end, selend)
  if (ms    !== undefined) waitms   = Math.max(ms, 1000)
  console.log("digaGetTitlesStart: selstart = ", selstart, ", selend =", selend, ", waitms =", waitms)

  // digaGetTitles()に対する初期設定
  tinfo    = ""
  selno    = selstart
  stopflag = false

  if (selno != selcur) {
    digaShowTitles(selno)
    setTimeout(digaGetTitles, waitms)
  } else {
    digaGetTitles()
  }
}

function selChecked(selectOptionNodeA) {
  for (var i = 0; i < selectOptionNodeA.length; i++) {
    if (selectOptionNodeA[i].selected) {
      return i
    }
  }
  errorAlert("ERROR: selChecked()")
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

// Get titles from screen(s) to screen(e)-1 with waitms
// digaGetTitlesStart(s, e, waitms)
