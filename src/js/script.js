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

function obiWaniFy() {
   if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const img = document.getElementById('obiWan');
        const dataUrl = getDataUrl(img);
        const css = "font-size: 40px;color:rgb(255,105,180);font-family:monospace;letter-spacing: 5px; text-shadow: 3px 3px 20px #ff99cc, -2px 1px 30px #ff99cc;padding:20px;";
        console.log("%cWELCOME %s", css, 'TO FLOW.FAIL STRANGER.');
        console.log("%cThis is not the console you are looking for.", "color:rgb(0,0,0); font-size:20px;font-family:monospace;padding-left:20px;");
        console.log("%c      ", "font-size:167px; margin-left:20px;background:url(" + dataUrl + ") no-repeat;");
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


async function getSomeMotivationalQuote() {
    quoteBox = document.getElementById('motivationQuote');
    authorBox = document.getElementById('motivationAuthor');
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
    const response = await fetch("src/media/motivations.json");
    return await response.json();
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
    }else {
        player.pause();
    }
}

