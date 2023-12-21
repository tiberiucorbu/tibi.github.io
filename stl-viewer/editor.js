import {html, LitElement} from "lit";
import * as monaco from "monaco-editor";
import {loadUmdScript} from "/website-commons/load-umd-script.js";
// import {INITIAL, Registry, parseRawGrammar} from 'vscode-textmate';

export class EditorWrapper extends LitElement {

    constructor() {
        super();
        self.MonacoEnvironment = {
            getWorkerUrl: function (moduleId, label) {
                if (label === 'json') {
                    return '/node_modules/monaco-editor/esm/vs/language/json/json.worker.js';
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return '/node_modules/monaco-editor/esm/vs/language/css/css.worker.js';
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return '/node_modules/monaco-editor/esm/vs/language/html/html.worker.js';
                }
                if (label === 'typescript' || label === 'javascript') {
                    return '/node_modules/monaco-editor/esm/vs/language/typescript/typescript.worker.jss';
                }
            }
        };
    }

    async firstUpdated() {
        const vsCodeTextmateModule = await loadUmdScript('/node_modules/vscode-textmate/release/main.js');

        const styleMapping = window[Symbol.for('monacoStyles')];
        if (styleMapping) {
            this.shadowRoot.adoptedStyleSheets = await Promise.all(Object.keys(styleMapping).map(key => styleMapping[key]));
        }
        monaco.languages.set

        monaco.editor.create(this.shadowRoot.getElementById('editor'), {
            value: [
                'from banana import *',
                '',
                'class Monkey:',
                '	# Bananas the monkey can eat.',
                '	capacity = 10',
                '	def eat(self, N):',
                "		'''Make the monkey eat N bananas!'''",
                '		capacity = capacity - N*banana.size',
                '',
                '	def feeding_frenzy(self):',
                '		eat(9.25)',
                '		return "Yum yum"'
            ].join('\n'),

            language: 'python'
        });
    }

    render() {
        return html`
            <div id="editor-host" >
                <div id="editor" style="min-height: 100px"></div>
            </div>
        `;
    }

}

customElements.define('tc-editor-wrapper', EditorWrapper);
