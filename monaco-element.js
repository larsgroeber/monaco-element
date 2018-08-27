import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { eventTypes } from './utils';
import iframeScript from './monaco';

/**
 * `monaco-element`
 * Webcomponent wrapper for the monaco editor.
 *
 * Sets value, language and theme.
 * Offers a value-changed event.
 *
 * Partly influenced by https://github.com/PolymerVis/monaco-editor
 *
 * @customElement
 * @polymer
 *
 * @author Lars Gröber <larsgroeber7@gmail.com>
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
      <iframe id="iframe"></iframe>
    `;
  }

  static get properties() {
    return {
      value: {
        type: String,
        value: '',
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
      libPath: {
        type: String,
        value: 'node_modules/monaco-editor/min/vs',
      },
    };
  }

  get document() {
    return this.iframe.contentWindow.document;
  }

  ready() {
    super.ready();

    this.initIFrame();

    window.addEventListener('message', message => {
      this.handleMessage(message);
    });
  }

  initIFrame() {
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
  }

  handleMessage(message) {
    try {
      let data = message.data;
      if (typeof message.data === 'string') {
        data = JSON.parse(message.data);
      }
      this._handleMessage(data);
    } catch (error) {
      console.error('[monaco-element] Error while parsing message:', error);
      return;
    }
  }

  _handleMessage(data) {
    if (data.event === eventTypes.valueChanged) {
      this.dispatchEvent(
        new CustomEvent('value-changed', { detail: data.payload })
      );
    } else if (data.event === eventTypes.ready) {
      this.onIFrameReady();
    }
  }

  onIFrameReady() {
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
}

window.customElements.define('monaco-element', MonacoElement);
