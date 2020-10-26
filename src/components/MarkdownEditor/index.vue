<template>
  <editor
    :initialValue="value"
    :options="editorOptions"
    height="500px"
    previewStyle="vertical"
  />
</template>

<script>
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'

import { Editor } from '@toast-ui/vue-editor'
import defaultOptions from './default-options'

export default {
  name: 'MarkdownEditor',
  components: {
    editor: Editor
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default() {
        return defaultOptions
      }
    },
    mode: {
      type: String,
      default: 'markdown'
    },
    height: {
      type: String,
      required: false,
      default: '300px'
    },
    language: {
      type: String,
      required: false,
      default: 'zh_CN' // https://github.com/nhnent/tui.editor/tree/master/src/js/langs
    }
  },
  data() {
    return {
      editorText: 'This is initialValue.'
    }
  },
  computed: {
    editorOptions() {
      const options = Object.assign({}, defaultOptions, this.options)
      options.initialEditType = this.mode
      options.height = this.height
      options.language = this.language
      options.hideModeSwitch = true
      return options
    }
  },
  methods: {}
}
</script>
