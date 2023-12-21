export async function loadUmdScript(url,module = {exports:{}}) {
    // https://stackoverflow.com/a/70148286/2406376
    // Hacky way to load an umd in esm... is a pity that authors of the esm didn't
    // added any way to support the well made and most used module definition before it :(
    const res = await fetch(url);
    const text = await res.text();
    const func = Function("module", "exports", text);
    func.call(module, module, module.exports);
    return module.exports;
}
