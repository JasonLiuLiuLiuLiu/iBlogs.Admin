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
              <el-input placeholder="自定义访问路径,如 my-first-article 默认为文章id" v-model="postForm.slug">
                <template slot="prepend">Https://iblogs.site/article/</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="tags">
              <el-input-tag :value="postForm.tags"></el-input-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="category">
              <el-select clearable v-model="postForm.category" placeholder="文章分类" style="width: 100%">
                <el-option
                  v-for="item in categories"
                  :key="item.key"
                  :label="item.value"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item prop="content" style="margin-bottom: 30px;">
            <markdown-editor ref="editor" :value="postForm.content" />
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item>
              <el-switch
                style="display: block"
                v-model="postForm.allowPing"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="允许Ping"
                inactive-text="禁用Ping">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-switch
                style="display: block"
                v-model="postForm.allowComment"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="启用评论"
                inactive-text="禁用评论">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-switch
                style="display: block"
                v-model="postForm.allowFeed"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="允许订阅"
                inactive-text="禁止订阅">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-switch
                style="display: block"
                v-model="postForm.haveImage"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="启用缩略图"
                inactive-text="禁用缩略图">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item>
              <el-date-picker
                v-model="postForm.createdTime"
                type="datetime"
                placeholder="选择日期时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="12">
            <el-form-item>
              <el-button @click="backToList">返回列表</el-button>
              <el-button type="primary">立即发布</el-button>
              <el-button type="warning">保存为草稿</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import MarkdownEditor from '@/components/MarkdownEditor'
import ElInputTag from '@/components/ElInputTag'
import { page } from '@/api/meta'

const defaultForm = {
  id: '',
  title: '',
  slug: '',
  tags: '',
  category: '',
  content: '',
  status: 'draft',
  fmtType: 'markdown',
  allowComment: true,
  allowPing: true,
  allowFeed: true,
  createdTime: '',
  haveImage: ''
}

export default {
  name: 'ArticleDetail',
  components: { MarkdownEditor, ElInputTag },
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
        category: [{ validator: validateRequire }]
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
      fromPage: 'article'
    }
  },
  computed: {

  },
  created() {
    page(this.categoryQuery).then(response => {
      this.categories = response.data.list.map(v => {
        return { key: v.id, value: v.name }
      })
    })
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
    const from = this.$route.query.from
    if (from) {
      this.fromPage = from
    }
    const id = this.$route.query.id
    if (id) {
      this.postForm.id = id
    }
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      /*      fetchArticle(id).then(response => {
              this.postForm = response.data

              // just for test
              this.postForm.title += `   Article Id:${this.postForm.id}`
              this.postForm.content_short += `   Article Id:${this.postForm.id}`

              // set tagsview title
              this.setTagsViewTitle()

              // set page title
              this.setPageTitle()
            }).catch(err => {
              console.log(err)
            })*/
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.postForm.title}`
    },
    submitForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: '成功',
            message: '发布文章成功',
            type: 'success',
            duration: 2000
          })
          this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
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
