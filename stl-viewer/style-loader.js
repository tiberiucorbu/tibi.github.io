const currentScriptPath = function (level = 0) {
    let line = (new Error()).stack.split('\n')[level + 1].split('@').pop().replace(/\:[0-9]+\:[0-9]+\)$/, '');
    return line
};
const params = new URLSearchParams(currentScriptPath().split('?', 2)[1]);

async function load(path) {
    try {
        const sheet = import(path,{
            assert: { type: 'css' }
        });

        console.log(sheet);
        return sheet;
    } catch (e) {
        console.log('unable to load style', params.toString());
        throw e;
    }
}

const path = params.get('path');
const style = load(path);
const key = params.get('destSymbol');
if (key) {

    if (!window[Symbol.for(key)]) {
        window[Symbol.for(key)] = {};
    }
    window[Symbol.for(key)][path] = style;
}
export default style;
