const gen = positionGenerator();
const positions = [
    ['0', '0', '20px', '20px'],
    ['100%', '100%', '-580px', '-335px'],
    ['100%', '0', '-580px', '20px'],
    ['0', '100%', '20px', '-325px']
];
const rickMp3 = document.createElement('audio');
let rickCounter = 0;

$(document).ready(function() {
   rickPosition('ricky');
});


function rickyfy() {
    const ricky = document.getElementById('ricky');

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.open('https://youtu.be/dQw4w9WgXcQ', '_blank').focus();
        return;
    }

    if (ricky.classList.contains('hidden')) {
        ricky.classList.remove('hidden')
        playRick();
    } else {
        moreRicks();
    }
}

function* positionGenerator() {
    let index = 0;
    while (true) {
        yield positions[index++ % positions.length]
    }
}


function playRick() {
    rickMp3.setAttribute('src', 'src/media/rick.mp3');
    rickMp3.setAttribute('autoplay', 'autoplay');
    rickMp3.setAttribute('loop', 'loop');
    rickMp3.setAttribute('id', 'myRickAudio');
    rickMp3.play();
}

function stopRick() {
    rickMp3.pause();
    rickMp3.currentTime = 0;
}

function rickPosition(id) {
 $('#'+id).mouseover(function() {
        let pos = gen.next();
        $(this).css({
            'left': pos.value[0],
            'top': pos.value[1],
            'margin-left': pos.value[2],
            'margin-top': pos.value[3]
        });
    });
}

function moreRicks() {
    if (rickCounter <= 10) {
        let anotherRick = document.createElement('audio');
        anotherRick.setAttribute('src', 'src/media/rick.mp3');
        anotherRick.setAttribute('autoplay', 'autoplay');
        anotherRick.setAttribute('loop', 'loop');
        anotherRick.play();

        let ricky = document.getElementById('ricky');
        let clone = ricky.cloneNode(true);
        let id = 'ricky' + rickCounter;

        clone.setAttribute('id', id);
        document.body.append(clone);
        rickPosition(id);
        let pos = gen.next();
        $('#'+id).css({
            'left': pos.value[0],
            'top': pos.value[1],
            'margin-left': pos.value[2],
            'margin-top': pos.value[3]
        });
        rickCounter++;
    }

}