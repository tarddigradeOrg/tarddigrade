import {Controller} from '@hotwired/stimulus';
import {fetch, ok} from "../utils/http";
import router from "../utils/routing";

export default class extends Controller {
    static targets = ['embed', 'container', 'close'];
    static classes = ['hidden', 'loading', 'embed'];
    static values = {
        type: String,
        image: String,
        isVisible: Boolean,
        loading: Boolean,
        url: String,
        html: String
    };

    async fetch(event) {
        event.preventDefault();

        if (this.isVisibleValue) {
            this.close();
            return;
        }

        if (this.htmlValue) {
            this.loadScripts();
            this.show();
            return;
        }

        if (this.typeValue === 'image' && this.hasImageValue) {
            this.htmlValue = `<img src='${window.location.origin}/media/${this.imageValue}'>`;
            this.show();
            return;
        }

        this.loadingValue = true;

        try {
            if (this.typeValue === 'image') {
                return;
            }

            const url = router().generate('ajax_fetch_embed', {url: this.urlValue});

            let response = await fetch(url, {method: 'GET'});

            response = await ok(response);
            response = await response.json();

            this.htmlValue = response.html;
            this.loadScripts();
            this.show();
        } catch (e) {
            alert('Oops, something went wrong.');
            throw e;
        } finally {
            this.loadingValue = false;
        }
    }

    close() {
        this.containerTarget.innerHTML = '';
        this.containerTarget.classList.add(this.hiddenClass);
        this.closeTarget.classList.add(this.hiddenClass);
        this.embedTarget.classList.add('d-inline');
        this.isVisibleValue = false;

        if (this.element.classList.contains('kbin-embed-content')) {
            this.element.getElementsByClassName('kbin-clearfix')[0].remove();
        }
    }

    show() {
        this.containerTarget.innerHTML = this.htmlValue
        this.containerTarget.classList.remove(this.hiddenClass);
        this.closeTarget.classList.remove(this.hiddenClass);
        this.embedTarget.classList.remove('d-inline');
        this.isVisibleValue = true;

        if (this.element.classList.contains('kbin-embed-content')) {
            const span = document.createElement('span')
            span.classList.add('clearfix', 'kbin-clearfix');

            const link = this.element.getElementsByTagName('a')[0];
            link.parentNode.insertBefore(span, link.nextSibling);
        }
    }

    loadingValueChanged() {
        if (this.loadingValue) {
            this.embedTarget.classList.remove(this.embedClass);
            this.embedTarget.classList.add(this.loadingClass);
        } else {
            if (this.hasEmbedTarget) {
                this.embedTarget.classList.remove(this.loadingClass);
                this.embedTarget.classList.add(this.embedClass);
            }
        }
    }

    loadScripts() {
        let tmp = document.createElement("div");
        tmp.innerHTML = this.htmlValue;
        let el = tmp.getElementsByTagName('script');

        if (el.length) {
            let script = document.createElement("script");
            script.setAttribute("src", el[0].getAttribute('src'));
            script.setAttribute("async", "false");

            // let exists = [...document.head.querySelectorAll('script')]
            //     .filter(value => value.getAttribute('src') >= script.getAttribute('src'));
            //
            // if (exists.length) {
            //     return;
            // }

            let head = document.head;
            head.insertBefore(script, head.firstElementChild);

            this.containerTarget.classList.remove('ratio')
            this.containerTarget.classList.remove('ratio-16x9')
        }
    }
}
