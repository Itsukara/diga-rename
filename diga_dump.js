// DIGAにログインして番組編集画面を出す
// No.選択セレクタで「21-40」を選択
// F12キーを押して「Developerコンソール」を出す
// sourcesを押して表示される左端の一覧から、「vvtl_list.cgi」を選択して表示
// ESCキーを押してコンソールを表示
// コンソールの左上のセレクタで「rightframe (vvtl_list.cgi)」を選択
// 以下のすべてをコンソールにペースト

// jqueryを読み込ませるとともに、正しいフレームが選択されているか確認
function requireJquery() {
head=document.querySelector("head")
jq = document.createElement('script')
jq.src="http://code.jquery.com/jquery-1.12.1.min.js"
head.appendChild(jq)
// 正しいフレームを選んでいることを確認
topno=document.querySelector("input[name='VT_TOPNO']")
return topno
}

// 録画内容をファイルに吐き出し
function digaOut() {
// get basic info
topno=document.querySelector("input[name='VT_TOPNO']").value
titleid=document.querySelector("input[name='VT_TITLEID']").value.split(":")

// get table info
table=document.querySelectorAll("table table")[2]
tbody=table.children[0]
rows=tbody.children

tinfo=""
for (var i = 0; i < rows.length; i++) {
  tds=rows[i].children
  rinfo = ""
  for (var j = 1; j < tds.length; j++) {
    dinfo = tds[j].textContent;
    dinfo = dinfo.replace(/\n/g,"");
    rinfo = rinfo + "\t" + dinfo;
  }
  if (i > 0) {
    rinfo = rinfo + "\t" + titleid[i-1]
  }
  tinfo += rinfo + "\n"
}

// write tinfo to file
content=tinfo
file_name="tinfo-" + topno + ".txt"
var blob=new Blob([content], {type: "text/text"})

var downloadLink = $('<a></a>');
downloadLink.attr('href', window.URL.createObjectURL(blob));
downloadLink.attr('download', file_name);
downloadLink.attr('target', '_blank');

$('body').append(downloadLink);
downloadLink[0].click();
downloadLink.remove();
}

// 処理の本体
if (requireJquery() == null) {
  console.log("コンソールの左上のセレクタで「rightframe (vvtl_list.cgi)」を選択してください")
} else {
  setTimeout(digaOut, 2000)
}

