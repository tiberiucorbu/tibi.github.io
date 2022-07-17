const gen = positionGenerator();
const positions = [
    ['0', '0', '20px', '20px'],
    ['100%', '100%', '-189px', '-50px'],
    ['100%', '0', '-189px', '20px'],
    ['0', '100%', '20px', '-50px']
];
const rickMp3 = document.createElement('audio');
let rickCounter = 0;

function rickyfy() {
    const ricky = document.getElementById('ricky');
    const stopAudio = document.getElementById('stopAudio');

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.open('https://youtu.be/dQw4w9WgXcQ', '_blank').focus();
        return;
    }

    if (ricky.classList.contains('hidden')) {
        ricky.classList.remove('hidden')
        stopAudio.classList.remove('hidden')
        stopAudioPosition();
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

function stopAudioPosition(id) {
 $('#stopAudio').mouseover(function() {
        let pos = gen.next();
        $(this).css({
            'left': pos.value[0],
            'top': pos.value[1],
            'margin-left': pos.value[2],
            'margin-top': pos.value[3]
        });
    });
}

function imagePosition(id) {
    let maxX = $(window).width()-250;
    let maxY = $(window).height()-20;
    let hue = 'hue-rotate('+getRandomIntMax(360)+'deg)';
    $('#'+id).css({
        'left': getRandomIntMinMax(250, maxX) +'px',
        'top': getRandomIntMinMax(360, maxY) +'px',
        'filter': hue
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
        imagePosition(id);
        rickCounter++;
    }
}

function getRandomIntMax(max) {
  return Math.floor(Math.random() * max);
}

function getRandomIntMinMax(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}