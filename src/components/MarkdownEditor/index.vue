<!--https://github.com/nhn/tui.editor/tree/master/apps/vue-editor-->
<template>
  <editor ref="toastuiEditor" />
</template>
<script>
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'

import { Editor } from '@toast-ui/vue-editor'

export default {
  components: {
    editor: Editor
  },
  methods: {
    scroll() {
      this.$refs.toastuiEditor.invoke('scrollTop', 10)
    },
    moveTop() {
      this.$refs.toastuiEditor.invoke('moveCursorToStart')
    },
    getHtml() {
      let html = this.$refs.toastuiEditor.invoke('getHtml')
    }
  }
}
</script>
