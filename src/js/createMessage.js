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
    urlInput.value = "https://flow.fail/msg?head=" + headMessage + "&msg=" + message;
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
}