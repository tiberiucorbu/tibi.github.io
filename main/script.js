import '/website-commons/js/tc-cookie.js'
import '/website-commons/js/tool-item.js'
import '/website-commons/js/card.js'
import '/website-commons/js/grid.js'
import '/website-commons/js/image-to-base64.js'
import '/website-commons/js/liquid-dialog.js'
import {loadData} from  '/website-commons/load-data.js'

const gen = positionGenerator();
const positions = [
    ['0', '0', '20px', '20px'],
    ['100%', '100%', '-260px', '-50px'],
    ['100%', '0', '-260px', '20px'],
    ['0', '100%', '20px', '-50px']
];
const rickMp3 = document.createElement('audio');
let quoteBox;
let authorBox;
let quotes;
let rickCounter = 0;
let noDoubleLoading = false;
let lastQuoteNumber;

window.addEventListener('load', async (event) => {
  await getSomeMotivationalQuote();
});

if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    window.document.addEventListener('touchmove', e => {
        if(e.scale !== 1) {
            e.preventDefault();
        }
    }, {passive: false});
}

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

function obiWaniFy() {
   if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const img = document.getElementById('obiWan');
        const dataUrl = getDataUrl(img);
        const css = "font-size: 40px;color:rgb(255,105,180);font-family:monospace;letter-spacing: 5px; text-shadow: 3px 3px 20px #ff99cc, -2px 1px 30px #ff99cc;padding:20px;";
        console.log("%cWELCOME %s", css, 'TO TIBI.ROCKS STRANGER.');
        console.log("%cThis is not the console you are looking for.", "color:rgb(0,0,0); font-size:20px;font-family:monospace;padding-left:20px;");
        console.log("%c      ", "font-size:167px; margin-left:20px;background:url(" + dataUrl + ") no-repeat;");
        console.log("%cThis is a fork of https://github.com/floriankuenzel/flow.github.io", "color:rgb(0,0,0); font-size:20px;font-family:monospace;padding-left:20px;");

   }
}

function getDataUrl(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg');
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

function stopAudioPosition() {
    $('#stopAudio').mouseover(function () {
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
    let maxX = $(window).width() - 250;
    let maxY = $(window).height() - 20;
    let hue = 'hue-rotate(' + getRandomIntMax(360) + 'deg)';
    $('#' + id).css({
        'left': getRandomIntMinMax(250, maxX) + 'px',
        'top': getRandomIntMinMax(360, maxY) + 'px',
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

async function getSomeMotivationalQuote() {
    quoteBox = document.getElementById('quote');
    authorBox = document.getElementById('author');
    quotes = await getQuotes();
    const quoteNumber = Math.floor(Math.random() * quotes.length);
    lastQuoteNumber = quoteNumber;
    quoteBox.innerText = quotes[quoteNumber].quote;
    authorBox.innerText = quotes[quoteNumber].author;
    quoteBox.classList.add('fade-in');
    authorBox.classList.add('fade-in');
}

async function reloadMotivationQuote() {
    if(!noDoubleLoading) {
        noDoubleLoading = true;
        const button = document.getElementById('reloadButton');
        showHide([quoteBox,authorBox,button]);
        let quoteNumber = lastQuoteNumber;
        while (quoteNumber===lastQuoteNumber){
            quoteNumber =Math.floor(Math.random() * quotes.length);
        }
        setTimeout(() => {
            quoteBox.innerText = quotes[quoteNumber].quote;
            authorBox.innerText = quotes[quoteNumber].author;
            hideShow([quoteBox,authorBox,button]);
            noDoubleLoading = false;
         }, 5000);
    }
}

async function getQuotes() {
    return loadData('/website-commons/media/motivations.json')
}

function showHide(array){
        array.forEach(element => {
                element?.classList.remove('fade-in');
                element?.classList.add('fade-out');
        })
}

function hideShow(array){
        array.forEach(element => {
                element?.classList.add('fade-in');
                element?.classList.remove('fade-out');
        })
}

function playPause() {
    const player = document.getElementById('player');
    if(player.paused) {
        player.play();
        document.getElementById('playMusic').classList.add('hidden');
        document.getElementById('pauseMusic').classList.remove('hidden');
    }else {
        player.pause();
        document.getElementById('pauseMusic').classList.add('hidden');
        document.getElementById('playMusic').classList.remove('hidden');
    }
}


obiWaniFy();
