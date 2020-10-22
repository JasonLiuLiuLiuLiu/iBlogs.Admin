<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="dialogFormVisible=true"
      >
        Add
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        label="ID"
        prop="id"
        align="center"
        width="80"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" width="300px">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.name" size="small" />
          </template>
          <span v-else class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Slug" width="200px" align="center">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.slug" size="small" />
          </template>
          <span v-else class="link-type">{{ row.slug }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Description" min-width="100px" align="center">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.description" size="small" />
          </template>
          <span v-else class="link-type">{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Reference Count" width="100px" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-check"
            @click="saveEdit(row)"
          >
            Ok
          </el-button>
          <el-button
            v-if="row.edit"
            size="small"
            icon="el-icon-refresh"
            type="warning"
            @click="cancelEdit(row)"
          >
            Cancel
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >
            Edit
          </el-button>
          <el-button
            type="warning"
            size="small"
            icon="el-icon-delete"
            :disabled="!(row.count === 0)"
            @click="deleteMetaAction(row)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog title="create" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Slug" prop="slug">
          <el-input v-model="temp.slug" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="createData">
          Save
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, save, deleteMeta } from '@/api/meta'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {},
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        type: 1
      },
      temp: {
        name: '',
        slug: '',
        description: ''
      },
      downloadLoading: false,
      dialogFormVisible: false,
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'blur' }],
        slug: [{ required: true, message: 'slug is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    if (this.$route.fullPath.endsWith('category')) {
      this.listQuery.type = 1
    } else {
      this.listQuery.type = 0
    }
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      page(this.listQuery).then(response => {
        this.list = response.data.list.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.originalName = v.name
          v.originalSlug = v.slug
          v.originalDescription = v.description
          return v
        })
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    cancelEdit(row) {
      row.name = row.originalName
      row.slug = row.originalSlug
      row.description = row.originalDescription
      row.edit = false
      this.$message({
        message: 'The value has been restored to the original value',
        type: 'warning'
      })
    },
    deleteMetaAction(row) {
      this.$confirm('This will permanently delete the category. Continue?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        deleteMeta({ id: row.id }).then(response => {
          const index = this.list.indexOf(row)
          if (index > -1) {
            this.list.splice(index, 1)
          }
          this.$message({
            message: 'category deleted successfully',
            type: 'success'
          })
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    async saveEdit(row) {
      const result = await save({
        id: row.id,
        name: row.name,
        type: this.listQuery.type,
        slug: row.slug,
        description: row.description
      })
      if (result.code === 200) {
        // eslint-disable-next-line require-atomic-updates
        row.edit = false
        // eslint-disable-next-line require-atomic-updates
        row.originalName = row.name
        // eslint-disable-next-line require-atomic-updates
        row.originalSlug = row.slug
        // eslint-disable-next-line require-atomic-updates
        row.originalDescription = row.description
        this.$message({
          message: result.message,
          type: 'success'
        })
      } else {
        this.$message({
          message: result.message,
          type: 'error'
        })
      }
    },
    async createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          save({
            id: null,
            name: this.temp.name,
            type: this.listQuery.type,
            slug: this.temp.slug,
            description: this.temp.description
          }).then(result => {
            if (result.code === 200) {
              this.$message({
                message: result.message,
                type: 'success'
              })
              this.dialogFormVisible = false
              this.getList()
            } else {
              this.$message({
                message: result.message,
                type: 'error'
              })
            }
          })
        }
      })
    }
  }
}
</script>
<style>

</style>
