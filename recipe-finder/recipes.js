import {html, LitElement} from 'lit';
import {loadFuzzySortLibrary} from "/website-commons/load-fuzzy-sort-library.js";
import {oncePromise} from "../habit-tracker/once-promise.js";
import {asyncAppend} from 'lit-html/directives/async-append';

class ConcatenatedJsonsTransformStream {
    constructor() {
        this.buff = '';
        const that = this;
        return new TransformStream({
            transform(chunk, controller) {
                if (chunk) {
                    that.buff += chunk
                    const items = that.buff.split('\n');
                    if (items.length === 1) {
                        controller.enqueue(JSON.parse(that.buff));
                    } else {
                        this.buff = items.pop();
                        for (const item of items) {
                            controller.enqueue(JSON.parse(item));
                        }
                    }
                }
            }
        })
    }
}

export class RecipeFinder extends LitElement {

    constructor() {
        super();
        this.ingredientGroups = new Map();
        this.recipes = new Set();
        this.results = [];
    }

    async firstUpdated(_changedProperties) {
        await loadFuzzySortLibrary.call(this);
        super.firstUpdated(_changedProperties);
        const that = this;
        const res = await fetch('./bbccouk-recipes.json');
        res.body.pipeThrough(new TextDecoderStream())
            .pipeThrough(new ConcatenatedJsonsTransformStream())
            .pipeTo(new WritableStream({
                write(recipe) {
                    that.addRecipe(recipe);
                    return oncePromise(that, 'click');

                }
            }));
    }

    addRecipe(recipe) {
        const item = {...recipe};
        this.recipes.add(item);
        item.titlePrepared = this.fuzzySort.prepare(recipe.title);
        for (const i of recipe.instructions_detailed) {
            const ingredient = i.ingredient;
            const preparedForSearch = this.fuzzySort.prepare(i.ingredient);
            i.preparedForSearch = preparedForSearch;
            if (ingredient) {
                if (this.ingredientGroups.has(ingredient)) {
                    this.ingredientGroups.get(ingredient).push(recipe);
                } else {
                    this.ingredientGroups.set(ingredient, [recipe]);
                }
            }
        }

    }

     *search(searchTerm) {

        for (const recipe of this.recipes.values()) {
            console.log(recipe.title);
            // const score = this.fuzzySort.single(searchTerm, recipe.titlePrepared);
            // console.log(score);
            // yield recipe;
        }
    }

    async handleSearchTermChange(e) {
        console.log('hello');
        const searchTerm = e.target.value;
        this.results =  this.recipes;// this.search(searchTerm);
        console.log(this.results);
    }

    render() {


        return html`
            <input @change=${this.handleSearchTermChange}/>

            ${html`
                <ul>${asyncAppend(this.results, (v) => html`
                    <li> ${v.title}</li>`)}
                </ul>`}


        `;
    }

}

customElements.define('tc-recipe-finder', RecipeFinder);
