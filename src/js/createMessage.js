window.addEventListener('load', async (event) => {
    const button = document.getElementById('createLink');
    button.addEventListener('click', async () => {
        createUrl();
    })
});


function createUrl() {
    const headInput = document.getElementById('headMessage');
    const messageInput = document.getElementById('message');
    const urlInput = document.getElementById('url');
    const headMessage = b64EncodeUnicode(headInput.value);
    const message = b64EncodeUnicode(messageInput.value);
    let url = new URL("https://flow.fail/msg");
    url.searchParams.append('head', headMessage);
    url.searchParams.append('msg', message);
    const urlString = url.toString();
    urlInput.value=urlString;
    navigator.clipboard.writeText(urlString);
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
}