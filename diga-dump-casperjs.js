debugger;
/*
  CasperJSを使って、DIGAの番組情報を取得するためのスクリプトです。
  利用に際し、NodeJS、PhantomJS、CasperJSを設定した環境が必要です。
  これらが整った環境において、下記コマンドで実行開始願います。
    casperjs diga-dump-casperjs.js
  
  なお、利用前に、DIGAのURLとログインパスワードを下記に追記願います。
*/

// DIGAのURLとログインパスワード
var URL = "";
var PASS = "";

var casper = require("casper").create();
/*
var casper = require("casper").create({
    verbose: true,
    logLevel: "debug"  
});
*/

casper.echo("");
if (URL === "" || PASS === "") {
  casper.die("diga-dump-casperjs.js中でDIGAのURLとログインパスワードを記載してから実行願います。");
}

// PhantomJSのfsモジュール (nodejsのfsと仕様が異なるので要注意)
var fs = require("fs");

function capture() {
    var fname = new Date().toISOString().substr(0,23).replace(/:/g, "-") + ".png";
    casper.capture(fname);
}

function dump_html() {
    var fname = new Date().toISOString().substr(0,23).replace(/:/g, "-") + ".html";
    fs.write(fname, casper.getHTML().replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
}

function write_txt(txt) {
    var fname = new Date().toISOString().substr(0,23).replace(/:/g, "-") + ".txt";
    fs.write(fname, txt, 'w');
}

// デバッグ用の各種イベント登録
casper.on('remote.alert', function(msg) {
  this.echo("REMOTE.ALERT: " + msg);
});

casper.on('remote.message', function(msg) {
  this.echo("REMOTE.MESSAGE: " + msg);
});

casper.on("page.error", function(msg, trace) {
  this.echo("PAGE.ERROR: " + msg);
  this.echo("TRACE:");
  for (var i = 0; i < trace.length; i++) {
    var trec = trace[i];
    this.echo("file: " + trec.file + " , line: " + trec.line + " , function: " + trec.function);
  }
  this.die("TRACE END and die");
});

casper.on('step.error', function(err) {
  this.die("STEP.ERROR: " + err);
});

casper.on("run.complete", function() {
    casper.echo("CASPER RUN.COMPLETE")   
});

// page DOM環境から渡されたスクリプトの実行
//
// page DOM環境から渡されたデータは、「remARGS」で参照可能
//
casper.on('remote.callback', function(data) {
  this.echo("REMOTE.CALLBACK:");
//  this.echo(JSON.stringify(data)); 
  var command = data.command;
  var remARGS = data.remARGS;

  this.echo("REMOTE.CALLBACK: <command is as follows>");
  this.echo(command);
//  this.echo("<remARGS is as follows>");
//  this.echo(JSON.stringify(remARGS)); 

  eval(command);

  this.echo("REMOTE.CALLBACK END");
});


// 処理スタート
casper.start();
casper.viewport(1024, 768);
casper.open(URL);

// login
casper.then(function() {
    casper.echo("■DIGAログイン開始");
    casper.withFrame(0, function() {
        this.fillSelectors('form[name="login_frm"]', {
            'input[name="passwd"]': PASS
        }, true);
    });
    casper.wait(5000);
});

// 番組編集画面表示
casper.then(function() {
    casper.echo("■番組編集画面開始");
    casper.withFrame("leftframe", function() {
        this.mouse.click('input[name="Image_DTitle"]');
    });
    casper.wait(5000);
});

// 番組情報取出し
casper.then(function() {
    casper.echo("■番組情報抽出開始");
    casper.evaluate(getTinfo)
    casper.wait(600000)
});

casper.then(function() {
    casper.echo("■ログアウト開始");
    casper.withFrame("leftframe", function() {
        this.mouse.click('input[name="Image_Logout"]');
    });
});


casper.run();


function getTinfo() {
///////////////////////////////////////////////////////////////////////
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
  selectOptionNodeA = $rall("select option")
  console.log("digaExtractTitles:", selno, "(", selectOptionNodeA[selno].innerHTML, ")")

  // 番組一覧表を取得
//  var titleTableNode = $rall("table table")[2]
//  var tbodyNode = titleTableNode.children[0]
  var tbodyNode = $rall("tbody")[4]
  var titleNodeA = tbodyNode.children
  var titleid = $rone('input[name="VT_TITLEID"]').value.split(":")

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
  var selectNode   = $rone('input[name="cCMD_VT_SELECT"]')
  var listnoNode   = $rone('input[name="cCMD_VT_LISTNO"]')

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

/*
function digaPostProcessing() {
  digaDumpTitles()
  digaSaveTitles()
}
*/

// CasperJS用のPostProcessing
function digaPostProcessing() {
  // PhantomJS+CasperJS環境で実行するコマンド
  var command = "write_txt(remARGS[0]); casper.die('digaGetTitles Finished')";
  // PhantomJS+CasperJS環境に渡すデータ
  var remARGS = [tinfo];
        
  window.callPhantom({
    command: command,
    remARGS: remARGS
  });
}


function digaGetTitlesStop() {
  stopflag = true
}


// メイン処理
// Get all titles
digaGetTitlesStart(22)

// Get titles from screen(s) to last screen
// digaGetTitlesStart(s)
//
// Get titles from screen(s) to screen(e)-1
// digaGetTitlesStart(s, e)
//
// Get titles from screen(s) to screen(e)-1 with waitms
// digaGetTitlesStart(s, e, waitms)

///////////////////////////////////////////////////////////////////////
}

