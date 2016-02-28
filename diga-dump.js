// 【使い方】
// ChromeでDIGAにログインする。
// 画面左側の番組編集ボタンを押して、番組名一覧を表示する。
// 一覧表の下にある「No.選択:」セレクタで、ダンプしたい場面を出す。
// (ダンプしたい画面が「1-20」の場合、一度、これ以外を選んでから戻す)
// F12キーを押してChromeの「Developer Tools」を出す。
// (「Console」が未表示の場合、ESCキーを押して「Console」を表示）
// コンソールの左上のセレクタで「rightframe (vvtl_list.cgi)」を選択。
// (元々は、「<top frame>」になっている部分)
// 本ファイルのすべてのテキストをコピーして、コンソールにペーストする。
// プログラムが番組情報を抽出し、「tinfo-200.txt」等のファイルに保管する。
// (chromeの左下に、ファイルをダウンロードしたことを示す情報が表示される）

function requireJquery() {
  var head = document.querySelector("head")
  var scriptJq = document.createElement('script')
  scriptJq.src = "http://code.jquery.com/jquery-1.12.1.min.js"
  head.appendChild(scriptJq)
    // 下記で、正しいフレームが選ばれていることを確認
  var topno = document.querySelector("input[name='VT_TOPNO']")
  return topno
}

// 録画内容をファイルに吐き出し
function digaDump() {
  // 基本的な情報を取得
  var topno = document.querySelector("input[name='VT_TOPNO']").value
  var titleid = document.querySelector("input[name='VT_TITLEID']").value.split(":")

  // 番組一覧表を取得
  var table = document.querySelectorAll("table table")[2]
  var tbody = table.children[0]
  var rows = tbody.children

  var tinfo = ""
  for (var i = 0; i < rows.length; i++) {
    var tds = rows[i].children
    var rinfo = ""
    var dinfo = ""
    for (var j = 1; j < tds.length; j++) {
      dinfo = tds[j].textContent;
      dinfo = dinfo.replace(/\n/g, "");
      rinfo = rinfo + "\t" + dinfo;
    }
    if (i == 0) {
      rinfo = rinfo + "\t" + "番組ID"
    } else {
      rinfo = rinfo + "\t" + titleid[i - 1]
    }
    tinfo += rinfo + "\n"
  }

  // write tinfo to file
  var content = tinfo
  var file_name = "tinfo-" + topno + ".txt"
  var blob = new Blob([content], {
    type: "text/text"
  })
  var downloadLink = $('<a></a>');
  downloadLink.attr('href', window.URL.createObjectURL(blob));
  downloadLink.attr('download', file_name);
  downloadLink.attr('target', '_blank');

  $('body').append(downloadLink);
  downloadLink[0].click();
  downloadLink.remove();
}

// ダンプ処理の本体
if (requireJquery() == null) {
  console.log("ERROR:コンソールの左上のセレクタで「rightframe (vvtl_list.cgi)」を選択してください!")
} else {
  // Jqueryが読み込まれるまで少し待つ
  setTimeout(digaDump, 2000)
}
