# \<monaco-element\>

Webcomponent wrapper for the monaco editor implementing basic functionality.

## Installation

```
npm install monaco-element
```

## Usage

```js
import 'monaco-element';

...

<monaco-element
  value="print('Hello World')"
  language="python"
  theme="vs-light"
  on-value-changed="handleEvent">
</monaco-element>
```

## Licence

MIT
