// �y�g�����z
//�@ 1.Chrome��DIGA�Ƀ��O�C���B
//�@ 2.��ʍ����̔ԑg�ҏW�{�^���������āA�ԑg���ꗗ��\���B
//�@ 3.��ʉ��́uNo.�I��:�v�Z���N�^�ŁA�_���v���J�n��������ʂ�\���B
//�@�@�i������s��Ȃ��ꍇ�́A�擪�ԑg�ȍ~�̑S�Ă̏����_���v)
//�@ 4.F12�L�[��������Chrome�́uDeveloper Tools�v��\���B
//�@ 5.diga-dump.js�̓��e���R�s�[���āA�R���\�[���Ƀy�[�X�g����B
//�@�@�E�y�[�X�g����Javascript�̃R�[�h���A�\������Ă����ʈȍ~��
//�@�@�@�S�Ă̔ԑg���������I�ɕ\���E���o���A�t�@�C���utinfo.txt�v�ɕۊǁB
//�E�r���Œ��~�������ꍇ�́A�R���\�[���ɉ��L��ł����ށB
//�@digaGetTitlesStop()
//�E�r���Œ��~�����̂��A���L�̂悤�ɉ��L�R�}���h�ōĎ��s�\�B
//�@�EdigaGetTitlesStart()�@�@�F�\����ʈȍ~�̔ԑg�������_���v
//�@�EdigaGetTitlesStart(s)�@ �Fs��ʖڈȍ~�̔ԑg�������_���v
//�@�EdigaGetTitlesStart(s, e)�Fs��ʖځ`(e-1)��ʖڂ̔ԑg�������_���v
//�@��s��ʖڂƂ́A�uNo.�I��:�v�Z���N�̉��Ԗڂ��Ƃ�����(0����n�܂�)

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

  // �ԑg�ꗗ�\���擾
  var table = rdoc.querySelectorAll("table table")[2]
  var tbody = table.children[0]
  var rows = tbody.children

  var imin = 1
  // �^�C�g���s�́A���̏����Ŏז��Ȃ̂ŁA�o�͂��Ȃ����ƂƂ����B
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
      rinfo = rinfo + "\t" + "�ԑgID"
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
  var file_name = "tinfo.txt"
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
// digaGetTitlesStart()

// Get all titles
digaGetTitlesStart(0)

// Get titles from screen(s) to screen(e)-1
// digaGetTitlesStart(s, e)
