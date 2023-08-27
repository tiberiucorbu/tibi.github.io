window.addEventListener('load', async (event) => {
    const button = document.getElementById('createLink');
    const textarea = document.getElementById('message');
    button.addEventListener('click', async () => {
        createUrl();
    })

    textarea.addEventListener('input', async (event) => {
        handleResize(event);
    })


});


function createUrl() {
    const headInput = document.getElementById('headMessage');
    const messageInput = document.getElementById('message');
    const headMessage = b64EncodeUnicode(headInput.value);
    const message = b64EncodeUnicode(messageInput.value);
    let url = new URL("https://flow.fail/msg");
    url.searchParams.append('head', headMessage);
    url.searchParams.append('msg', message);
    const urlString = url.toString();
    navigator.clipboard.writeText(urlString);
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
}

function handleResize(event) {
    const textarea = document.getElementById('message');
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}