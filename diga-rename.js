var binfoF = document.querySelector("input[name='BINFO']")
var titleF = document.querySelector("input[name='cVTE_TITLE']")
var topnoF = document.querySelector("input[name='VT_TOPNO']")
var noF = document.querySelector("input[name='VT_NO']")
var titleidF = document.querySelector("input[name='VT_TITLEID']")

// ���L�ɂ��A1�ԑg���ƂɁADIGA�̏���������8000�~���b(8�b)�҂B
// ���L�ł��܂������Ȃ��ꍇ�́A�l�𑝂₵�Ă��������B
// �Ȃ��ALAN�^�撆�́A�l�b�g�o�R�̔ԑg���ύX���ł��܂���B
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
    binfoF.value = "�ԑg�������������I"
  }
}
