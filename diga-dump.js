// �y�g�����z
// Chrome��DIGA�Ƀ��O�C������B
// ��ʍ����̔ԑg�ҏW�{�^���������āA�ԑg���ꗗ��\������B
// �ꗗ�\�̉��ɂ���uNo.�I��:�v�Z���N�^�ŁA�_���v��������ʂ��o���B
// (�_���v��������ʂ��u1-20�v�̏ꍇ�A��x�A����ȊO��I��ł���߂�)
// F12�L�[��������Chrome�́uDeveloper Tools�v���o���B
// (�uConsole�v�����\���̏ꍇ�AESC�L�[�������āuConsole�v��\���j
// �R���\�[���̍���̃Z���N�^�Łurightframe (vvtl_list.cgi)�v��I���B
// (���X�́A�u<top frame>�v�ɂȂ��Ă��镔��)
// �{�t�@�C���̂��ׂẴe�L�X�g���R�s�[���āA�R���\�[���Ƀy�[�X�g����B
// �v���O�������ԑg���𒊏o���A�utinfo-200.txt�v���̃t�@�C���ɕۊǂ���B
// (chrome�̍����ɁA�t�@�C�����_�E�����[�h�������Ƃ�������񂪕\�������j

function requireJquery() {
  var head = document.querySelector("head")
  var scriptJq = document.createElement('script')
  scriptJq.src = "http://code.jquery.com/jquery-1.12.1.min.js"
  head.appendChild(scriptJq)
    // ���L�ŁA�������t���[�����I�΂�Ă��邱�Ƃ��m�F
  var topno = document.querySelector("input[name='VT_TOPNO']")
  return topno
}

// �^����e���t�@�C���ɓf���o��
function digaDump() {
  // ��{�I�ȏ����擾
  var topno = document.querySelector("input[name='VT_TOPNO']").value
  var titleid = document.querySelector("input[name='VT_TITLEID']").value.split(":")

  // �ԑg�ꗗ�\���擾
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
      rinfo = rinfo + "\t" + "�ԑgID"
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

// �_���v�����̖{��
if (requireJquery() == null) {
  console.log("ERROR:�R���\�[���̍���̃Z���N�^�Łurightframe (vvtl_list.cgi)�v��I�����Ă�������!")
} else {
  // Jquery���ǂݍ��܂��܂ŏ����҂�
  setTimeout(digaDump, 2000)
}
