const gen = positionGenerator();
const positions = [['0','0','20px','20px'],['100%','100%','-580px','-335px'],['100%','0','-580px','20px'],['0','100%','20px','-325px']];

$(document).ready(function(){
    $('#ricky').mouseover(function () {
        var pos = gen.next();
        $(this).css({
            'left':pos.value[0],
            'top':pos.value[1],
            'margin-left':pos.value[2],
            'margin-top':pos.value[3]
        });
    });
});


function rickyfy() {
    const ricky = document.getElementById('ricky');
    const iframe = document.getElementById('rickyFrame');

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        window.open('https://youtu.be/dQw4w9WgXcQ', '_blank').focus();
        return;
    }

    if (ricky.classList.contains('hidden')) {
        ricky.classList.remove('hidden')
        iframe.src += '?autoplay=1';
    } else {
        ricky.classList.add('hidden');
        iframe.src = iframe.src.replace('?autoplay=1', '');
    }
}

function* positionGenerator() {
    let index = 0;
    while (true) {
         yield positions[index++%positions.length]
    }
}