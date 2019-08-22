import { html, css, LitElement } from 'lit-element';
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
class MonacoElement extends LitElement {

  constructor() {
    super();
    this.iframe = null;
    this.value = '';
    this.language = 'javascript';
    this.theme = 'vs-dark';
    this.libPath = '/node_modules/monaco-editor/min/vs';
  }

  static get styles() {
    const style = css`
      :host {
        display: block;
      }
      iframe {
        border: none;
        width: 100%;
        height: 100%;
        padding: 0;
      }
    `;

    return [style];
  }

  static get properties() {
    return {
      value: { type: String },
      language: { type: String, reflect: true},
      theme: { type: String, reflect: true},
      autogrow: {type: Boolean, reflect: true, attribute: 'autogrow'},
      maxHeight: {type: Number, reflect: true, attribute: 'max-height'},
      libPath: { type: String },
    };
  }

  attributeChangedCallback(name, old, val) {
    super.attributeChangedCallback(name, old, val);
    setTimeout(() => {
      if (name == "value" && old != val) {
        this.monacoValueChanged(val);
      } else if (name == "language" && old != val) {
        this.monacoLanguageChanged(val);
      } else if (name == "theme" && old != val) {
        this.monacoThemeChanged(val);
      } else if (name == "autogrow") {
        this.monacoAutogrowChanged();
      } else if (name == 'max-height') {
        this.monacoMaxHeightChanged();
      }
    }, 100);
  }

  render() {
    return html`<iframe id="iframe"></iframe>`;
  }

  get document() {
    return this.iframe.contentWindow.document;
  }

  firstUpdated() {
    super.firstUpdated();
    this.initIFrame();
    window.addEventListener('message', message => {
      this.handleMessage(message);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('message', message => {
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
    } else if (data.event == eventTypes.heightChanged) {
      this.iframe.style.height = data.payload + 'px';
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

  monacoAutogrowChanged() {
    this.postMessage(eventTypes.autogrowChanged, this.autogrow);
  }

  monacoMaxHeightChanged() {
    this.postMessage(eventTypes.maxHeightChanged, this.maxHeight);
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
    let css = `
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
