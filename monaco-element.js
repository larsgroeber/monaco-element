import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { eventTypes } from './utils';
import iframeScript from './monaco';

/**
 * `monaco-element`
 * Webcomponent wrapper for the monaco editor.
 *
 * @customElement
 * @polymer
 */
class MonacoElement extends PolymerElement {
  constructor() {
    super();
    this.iframe = null;
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        iframe {
          border: none;
          width: 100%;
          height: 100%;
          padding: 0;
        }
      </style>
      <iframe id="iframe" style="width: 100%"></iframe>
    `;
  }
  static get properties() {
    return {
      value: {
        type: String,
        value: 'monaco-element',
        observer: 'monacoValueChanged',
      },
      language: {
        type: String,
        value: 'javascript',
        observer: 'monacoLanguageChanged',
      },
      theme: {
        type: String,
        value: 'vs-dark',
        observer: 'monacoThemeChanged',
      },
    };
  }

  ready() {
    super.ready();
    // do something that requires access to the shadow tree
    this.iframe = this.shadowRoot.querySelector('#iframe');
    const div = this.document.createElement('div');
    div.id = 'container';
    this.document.body.appendChild(div);

    this.insertScriptElement({
      src: `${this.libPath}/loader.js`,
      onload: () => {
        this.insertScriptElement({ text: iframeScript });
        this.insertStyle();
      },
    });

    window.addEventListener('message', message => {
      this.handleMessage(message);
    });
  }

  handleMessage(message) {
    try {
      const data = JSON.parse(message.data);
      this._handleMessage(data);
    } catch (error) {
      console.error('Error while parsing message:', error);
      return;
    }
  }

  _handleMessage(data) {
    if (data.event === eventTypes.valueChanged) {
      this.dispatchEvent(
        new CustomEvent('value-changed', { detail: data.payload })
      );
    } else if (data.event === eventTypes.ready) {
      this.onIframeReady();
    }
  }

  onIframeReady() {
    this.monacoValueChanged(this.value);
    this.monacoLanguageChanged(this.language);
    this.monacoThemeChanged(this.theme);
  }

  monacoValueChanged(value) {
    this.postMessage(eventTypes.valueChanged, value);
  }

  monacoLanguageChanged(value) {
    this.postMessage(eventTypes.languageChanged, value);
  }

  monacoThemeChanged(value) {
    this.postMessage(eventTypes.themeChanged, value);
  }

  postMessage(event, payload) {
    if (!this.iframe) {
      return;
    }
    this.iframe.contentWindow.postMessage(
      JSON.stringify({ event, payload }),
      window.location.href
    );
  }

  insertScriptElement({ src, text, onload }) {
    const ele = this.document.createElement('script');
    if (src) ele.src = src;
    if (text) ele.text = text;
    if (onload) ele.onload = onload;
    this.document.head.appendChild(ele);
  }

  insertStyle() {
    var css = `
    body {
      height: 100vh;
      overflow: hidden;
      margin: 0;
    }    
    #container {
      width: 100%;
      height: 100%;
    }
    .debug-red {
      background : red;
    }
    .debug-green {
      background : green;
    }
    html,body {
      margin : 0px;
    }`;
    const head = this.document.head;
    const style = this.document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(this.document.createTextNode(css));
    }
    head.appendChild(style);
  }

  get document() {
    return this.iframe.contentWindow.document;
  }

  get libPath() {
    return 'node_modules/monaco-editor/min/vs';
  }
}

window.customElements.define('monaco-element', MonacoElement);
