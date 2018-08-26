import { html, PolymerElement } from "./node_modules/@polymer/polymer/polymer-element.js";
import "./monaco-element.js";
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

class MonacoElementDemo extends PolymerElement {
  constructor() {
    super();
    this.code = {
      python: `print('Hello World')`,
      javascript: `console.log('Hello World')`,
      c: ['#include <stdio.h>', 'int main()', '{', '\tprintf("Hello, World!");', '\treturn 0;', '}'].join('\n')
    };
    this.language = 'javascript';
    this.value = this.code[this.language];
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        #output {
          background: white;
          padding: 5px;
          min-height: 100px;
        }
        monaco-element {
          height: 40vh;
        }
      </style>
      <h2>Monaco Element Demo</h2>
      <monaco-element on-value-changed="valueChanged" value="[[value]]" theme="[[theme]]" language="[[language]]"></monaco-element>
      <select on-change="themeChanged">
        <option value="vs-dark">vs-dark</option>
        <option value="vs-light">vs-light</option>
      </select>
      <select on-change="languageChanged">
        <option value="javascript">javascript</option>
        <option value="python">python</option>
        <option value="c">c</option>
      </select>
      <button on-click="clear" style="float:right">Clear</button>
      <h4>Output:</h4>
      <pre id="output">[[value]]</pre>
    `;
  }

  static get properties() {
    return {
      value: String,
      language: String,
      theme: String
    };
  }

  valueChanged(event) {
    console.log(event);
    this.value = event.detail;
  }

  clear() {
    this.value = '';
  }

  themeChanged(event) {
    this.theme = event.target.value;
  }

  languageChanged(event) {
    this.language = event.target.value;
    this.value = this.code[this.language];
  }

}

window.customElements.define('monaco-element-demo', MonacoElementDemo);