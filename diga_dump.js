// DIGA�Ƀ��O�C�����Ĕԑg�ҏW��ʂ��o��
// No.�I���Z���N�^�Łu21-40�v��I��
// F12�L�[�������āuDeveloper�R���\�[���v���o��
// sources�������ĕ\������鍶�[�̈ꗗ����A�uvvtl_list.cgi�v��I�����ĕ\��
// ESC�L�[�������ăR���\�[����\��
// �R���\�[���̍���̃Z���N�^�Łurightframe (vvtl_list.cgi)�v��I��
// �ȉ��̂��ׂĂ��R���\�[���Ƀy�[�X�g

// jquery��ǂݍ��܂���ƂƂ��ɁA�������t���[�����I������Ă��邩�m�F
function requireJquery() {
head=document.querySelector("head")
jq = document.createElement('script')
jq.src="http://code.jquery.com/jquery-1.12.1.min.js"
head.appendChild(jq)
// �������t���[����I��ł��邱�Ƃ��m�F
topno=document.querySelector("input[name='VT_TOPNO']")
return topno
}

// �^����e���t�@�C���ɓf���o��
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

// �����̖{��
if (requireJquery() == null) {
  console.log("�R���\�[���̍���̃Z���N�^�Łurightframe (vvtl_list.cgi)�v��I�����Ă�������")
} else {
  setTimeout(digaOut, 2000)
}

