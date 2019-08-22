/**
 * Gets injected into the iframe after monaco loader runs.
 */
export default `
const eventTypes = {
  ready: 'ready',
  valueChanged: 'valueChanged',
  languageChanged: 'languageChanged',
  themeChanged: 'themeChanged',
  autogrowChanged: 'autogrowChanged',
  heightChanged: 'heightChanged',
  maxHeightChanged: 'maxHeightChanged',
  minHeightChanged: 'minHeightChanged'
};

class MonacoEditor {

  constructor() {
    this.language = 'javascript';
    this.value = '';
    this.theme = 'vs-dark';
    this.autogrow = false;
    this.maxHeight = -1;
    this.minHeight = -1;
    this.editor = null;
    this.setupEventListener('message', this.handleMessage.bind(this));
    this.setupEditor();
  }

  setupEditor() {
    require.config({ paths: { vs: '/node_modules/monaco-editor/min/vs' } });
    require(['vs/editor/editor.main'], () => {
      this.editor = monaco.editor.create(document.getElementById('container'), {
        value: this.value,
        language: this.language,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        minimap: {
          enabled: false
        }
      });
      const model = this.editor.getModel();
      model.onDidChangeContent(() => {
        const value = model.getValue();
        this.onValueChanged(value);
        if (this.autogrow) {
          this.grow();
        }
      });

      this.ready();
    });
  }

  ready() {
    this.postMessage(eventTypes.ready, null);
    this.setupEventListener(
      eventTypes.valueChanged,
      this.onValueChanged.bind(this)
    );
  }

  _handleMessage(data) {
    switch (data.event) {
      case eventTypes.valueChanged:
        this.onInputValueChanged(data.payload);
        break;
      case eventTypes.languageChanged:
        this.onLanguageChanged(data.payload);
        break;
      case eventTypes.themeChanged:
        this.onThemeChanged(data.payload);
        break;
      case eventTypes.autogrowChanged:
        this.onAutoGrowChanged(data.payload);
        break;
      case eventTypes.maxHeightChanged:
        this.maxHeight = data.payload;
        this.grow();
        break;
      case eventTypes.minHeightChanged:
        this.minHeight = data.payload;
        this.grow();
        break;
    }
  }

  handleMessage(message) {
    try {
      const data = JSON.parse(message.data);
      this._handleMessage(data);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  postMessage(event, payload) {
    window.parent.postMessage(
      JSON.stringify({ event, payload }),
      window.parent.location.href
    );
  }

  setupEventListener(type, callback) {
    window.addEventListener(type, data => {
      callback(data);
    });
  }

  grow() {
    if (this.editor) {
      const height = this.editor.getModel().getLineCount() * 19;
      this.setHeight(height);
    }
  }

  onInputValueChanged(newValue) {
    require(['vs/editor/editor.main'], () => {
      if (newValue !== this.value) {
        this.value = newValue;
        this.editor.getModel().setValue(newValue);
      }
    });
  } 

  setHeight(height) {
    height = this.maxHeight > 0 && height > this.maxHeight ? this.maxHeight : height;
    height = this.minHeight > 0 && height < this.minHeight ? this.minHeight : height;
    this.postMessage(eventTypes.heightChanged, height);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.editor.layout();
    }, 1);
  }

  onAutoGrowChanged(autogrow) {
    this.autogrow = autogrow;
    if (this.autogrow) {
      this.grow();
    }
  }

  onValueChanged(newValue) {
    if (newValue !== this.value) {
      this.value = newValue;
      this.postMessage(eventTypes.valueChanged, newValue);
    }
  }

  onLanguageChanged(newLang) {
    require(['vs/editor/editor.main'], () => {
      monaco.editor.setModelLanguage(this.editor.getModel(), newLang);
    });
    this.language = newLang;
  }

  onThemeChanged(newValue) {
    require(['vs/editor/editor.main'], () => {
      monaco.editor.setTheme(newValue);
    });
    this.theme = newValue;
  }
}

new MonacoEditor();
`;
