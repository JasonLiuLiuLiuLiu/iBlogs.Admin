<template>
  <div
    class="el-input-tag input-tag-wrapper"
    :class="[size ? 'el-input-tag--' + size : '']"
    @click="foucusTagInput">
    <el-tag
      v-for="(tag, idx) in innerTags"
      :key="tag"
      :size="size"
      :closable="!readOnly"
      :disable-transitions="false"
      @close="remove(idx)">
      {{ tag }}
    </el-tag>
    <el-autocomplete
      v-model.trim="newTag"
      :fetch-suggestions="TagSearchAsync"
      placeholder="文章标签"
      style="outline:none;      border:none;"
      @select="handleSelect"
      clearable
    ></el-autocomplete>
  </div>
</template>

<script>
import { page } from '@/api/meta'

export default {
  name: 'ElInputTag',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    addTagOnKeys: {
      type: Array,
      default: () => [13, 188, 9]
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    size: String
  },
  data() {
    return {
      newTag: '',
      innerTags: [...this.value],
      dialog_temp: {},
      tagQuery: {
        pageNum: 1,
        pageSize: 9999999,
        type: 0
      },
      tags: ''
    }
  },
  watch: {
    value() {
      this.innerTags = [...this.value]
    }
  },
  created() {
    page(this.tagQuery).then(response => {
      this.tags = response.data.list.map(v => {
        return { key: v.id, value: v.name }
      })
    })
  },
  methods: {
    foucusTagInput() {
      if (this.readOnly || !this.$el.querySelector('.tag-input')) {
        return
      } else {
        this.$el.querySelector('.tag-input').focus()
      }
    },
    // handleSelect是自己实现的方法
    handleSelect(item) {
      let addSuccess = false
      if (this.addTag(this.newTag.trim())) {
        addSuccess = true
      }
      if (addSuccess) {
        this.tagChange()
        this.newTag = ''
      }
      console.log('value---1')
      console.log(this.innerTags) // 选中的数据保存在了this.innerTags中，这个用来和后端交互
      console.log('value---2')
    },
    // addNew是https://github.com/xiispace/el-input-tag/blob/master/src/ElInputTag.vue上原先的方法
    addNew(e) {
      if (e && (!this.addTagOnKeys.includes(e.keyCode)) && (e.type !== 'blur')) {
        return
      }
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      let addSuccess = false
      if (this.newTag.includes(',')) {
        this.newTag.split(',').forEach(item => {
          if (this.addTag(item.trim())) {
            addSuccess = true
          }
        })
      } else {
        if (this.addTag(this.newTag.trim())) {
          addSuccess = true
        }
      }
      if (addSuccess) {
        this.tagChange()
        this.newTag = ''
      }
    },
    addTag(tag) {
      tag = tag.trim()
      if (tag && !this.innerTags.includes(tag)) {
        this.innerTags.push(tag)
        return true
      }
      return false
    },
    remove(index) {
      this.innerTags.splice(index, 1)
      this.tagChange()
      console.log('value---1')
      console.log(this.innerTags)
      console.log('value---2')
    },
    removeLastTag() {
      if (this.newTag) {
        return
      }
      this.innerTags.pop()
      this.tagChange()
    },
    tagChange() {
      this.$emit('input', this.innerTags)
      this.$emit('update:value', this.innerTags)
    },

    // 下面两个方法是autocomplete相关的搜索方法
    TagSearchAsync(queryString, cb) {
      const results = queryString
        ? this.tags.filter(this.createTagFilter(queryString))
        : this.tags

      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 100 * Math.random())
    },
    createTagFilter(queryString) {
      return state => {
        return (
          state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    }
  }
}
</script>

<style scoped>
.input-tag-wrapper {
  position: relative;
  font-size: 14px;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  outline: none;
  padding: 0 10px 0 5px;
  transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  width: 100%;
}

.el-tag {
  margin-right: 4px;
}

.tag-input {
  background: transparent;
  border: none !important;
  font-size: 14px;
  height: 40px;
  outline: none;
  padding-left: 0;
  width: 100px;
}

.el-input-tag--mini .tag-input {
  height: 28px;
  line-height: 28px;
}

.el-input-tag--small .tag-input {
  height: 32px;
  line-height: 32px;
}

.el-input-tag--medium .tag-input {
  height: 36px;
  line-height: 36px;
}

/* 下面这个的效果是autocomplete的input没有边框*/
/deep/ input {
  /* input { */
  /* background-color: red!important;  调试用的样式 */
  outline: none !important;
  border: none !important;
}
</style>
