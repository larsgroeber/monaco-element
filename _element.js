import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `monaco-element`
 * Webcomponent wrapper for the monaco editor.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class MonacoElement extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'monaco-element',
      },
    };
  }
}

window.customElements.define('monaco-element', MonacoElement);
