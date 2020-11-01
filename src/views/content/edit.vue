<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <div class="createPost-main-container">
        <el-row>
          <el-col :span="12">
            <el-form-item prop="title">
              <el-input v-model="postForm.title" :maxlength="100" placeholder="文章标题" name="name" required>
                Title
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="slug">
              <el-input v-model="postForm.slug" placeholder="自定义访问路径,如 my-first-article 默认为文章id">
                <template slot="prepend">Https://iblogs.site/{{ contentType === 0 ? 'article/' : '' }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="tags">
              <el-input-tag :value.sync="postForm.tags" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="category">
              <el-select v-model="postForm.category" clearable placeholder="文章分类" style="width: 100%">
                <el-option
                  v-for="item in categories"
                  :key="item.key"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item prop="content" style="margin-bottom: 30px;">
            <editor
              ref="content"
              :initialValue="postForm.content"
              :options="editorOptions"
              height="600px"
              initialEditType="markdown"
              previewStyle="vertical"
              @change="onEditChange"
            />
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="4">
            <el-form-item>
              <el-switch
                v-model="postForm.allowPing"
                style="display: block"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="允许Ping"
                inactive-text="禁用Ping"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item>
              <el-switch
                v-model="postForm.allowComment"
                style="display: block"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="启用评论"
                inactive-text="禁用评论"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item>
              <el-switch
                v-model="postForm.allowFeed"
                style="display: block"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="允许订阅"
                inactive-text="禁止订阅"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item style="margin: 0" prop="publishTm">
              <el-date-picker
                v-model="publishTm"
                type="datetime"
                placeholder="发布时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5" :offset="3">
            <el-form-item style="margin: 0">
              <el-button @click="backToList">返回列表</el-button>
              <el-button type="primary" @click="submitForm">立即发布</el-button>
              <el-button type="warning" @click="draftForm">保存为草稿</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'

import { Editor } from '@toast-ui/vue-editor'
import ElInputTag from '@/components/ElInputTag'
import { page } from '@/api/meta'
import { details, save } from '@/api/content'

const defaultForm = {
  id: '',
  title: '',
  slug: '',
  tags: [],
  category: '',
  content: '',
  status: 'draft',
  fmtType: 'markdown',
  allowComment: false,
  allowPing: false,
  allowFeed: false,
  created: ''
}
var refreshIntervalId

export default {
  name: 'ArticleDetail',
  components: { Editor, ElInputTag },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        category: [{ validator: validateRequire }],
        publishTm: [{ validator: validateRequire }]
      },
      tempRoute: {},
      isEdit: {
        type: Boolean,
        default: false
      },
      categoryQuery: {
        pageNum: 1,
        pageSize: 9999999,
        type: 1
      },
      categories: '',
      fromPage: '/',
      contentType: 0,
      editorOptions: {
        hideModeSwitch: true
      },
      publishTm: ''
    }
  },
  computed: {},
  created() {
    page(this.categoryQuery).then(response => {
      this.categories = response.data.list.map(v => {
        return { key: v.id, value: v.name }
      })
    })
    const from = this.$route.query.from
    if (from) {
      this.fromPage = from
    }
    const id = this.$route.query.id
    if (id) {
      this.postForm.id = id
      this.fetchData(id)
    }
    const type = this.$route.query.type
    if (type) {
      this.contentType = type
    }
    refreshIntervalId = setInterval(this.autoSave, 10 * 1000)
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      details({ id: id }).then(response => {
        this.postForm = response.data
        // set page title
        this.setPageTitle()
        this.publishTm = this.postForm.created
        if (this.postForm.fmtType === 'markdown') {
          this.$refs.content.invoke('setMarkdown', this.postForm.content)
        } else {
          this.$refs.content.invoke('setHtml', this.postForm.content)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // https://nhn.github.io/tui.editor/latest/ToastUIEditor#addHook
    // https://github.com/nhn/tui.editor/tree/master/apps/vue-editor
    onEditChange() {
      this.postForm.content = this.$refs.content.invoke('getMarkdown')
      this.postForm.fmtType = 'markdown'
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.postForm.title}`
    },
    submitForm() {
      console.log(this.postForm)
      const beforeStatus = this.postForm.status
      this.postForm.status = 'Published'
      this.postForm.created = new Date(this.publishTm).getTime()
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          save(this.postForm).then(r => {
            this.$notify({
              title: '成功',
              message: '发布文章成功',
              type: 'success',
              duration: 2000
            })
          })
          this.loading = false
          clearInterval(refreshIntervalId)
        } else {
          this.postForm = beforeStatus
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.postForm.created = new Date(this.publishTm).getTime()
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.postForm.status = 'Draft'
      save(this.postForm).then(r => {
        this.$message({
          message: '保存成功',
          type: 'success',
          showClose: true,
          duration: 1000
        })
        clearInterval(refreshIntervalId)
      })
    },
    autoSave() {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          if (!this.postForm.status) {
            this.postForm.status = 'Draft'
          }
          this.postForm.created = new Date(this.publishTm).getTime()
          save(this.postForm)
        }
      })
    },
    backToList() {
      this.$router.push(this.fromPage)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.form-container {
  .el-form-item {
    margin: 10px 10px 10px 10px;
  }
}

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
