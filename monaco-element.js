import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { eventTypes } from './utils';

/**
 * `monaco-element`
 * Webcomponent wrapper for the monaco editor.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
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
      },
      language: {
        type: String,
        value: 'javascript',
      },
      theme: {
        type: String,
        value: 'vs-dark',
      },
    };
  }

  ready() {
    super.ready();
    // do something that requires access to the shadow tree
    this.iframe = this.shadowRoot.querySelector('#iframe');
    this.iframe.src = './monaco.html';
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
        new CustomEvent('value-changed', { value: data.payload })
      );
    } else if (data.event === eventTypes.ready) {
      this.onIframeReady();
    }
  }

  onIframeReady() {
    this.monacoValue = this.value;
    this.monacoLanguage = this.language;
    this.monacoTheme = this.theme;
  }

  set monacoValue(value) {
    this.postMessage(eventTypes.valueChanged, value);
  }

  set monacoLanguage(value) {
    this.postMessage(eventTypes.languageChanged, value);
  }

  set monacoTheme(value) {
    this.postMessage(eventTypes.themeChanged, value);
  }

  postMessage(event, payload) {
    this.iframe.contentWindow.postMessage(
      JSON.stringify({ event, payload }),
      window.location.href
    );
  }
}

window.customElements.define('monaco-element', MonacoElement);
