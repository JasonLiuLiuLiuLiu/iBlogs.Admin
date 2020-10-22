<template>
  <div class="app-container">
    <el-table
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
        <template slot-scope="{row}" width="70px">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Title" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title|longTextFilter(10) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Slug" width="100px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.slug }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Content" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.content|longTextFilter(50) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Category" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hits" width="50px">
        <template slot-scope="{row}">
          <span>{{ row.hits }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Comments" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.commentsNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Created" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.created|timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Modified" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.modified|timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" class-name="status-col" align="center" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter" class="statusTag">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >
            Edit
          </el-button>
          <el-button type="warning" size="mini" icon="el-icon-delete"  @click="deleteComment(row)">
            Delete
          </el-button>
          <el-button :type="row.statusBool?'':'success'" :icon="row.statusBool?'el-icon-cloudy-and-sunny':'el-icon-sunrise'" size="mini" @click="updateStatus(row)">
            {{ row.statusBool ? 'Draft' : 'Publish' }}
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
  </div>
</template>

<script>
import { page } from '@/api/content'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        'Published': 'success',
        'Draft': 'info'
      }
      return statusMap[status]
    },
    statusBoolFilter(status) {
      return status === 'Approved'
    },
    timeFilter(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },
    longTextFilter(text, length) {
      if (text.length < length) {
        return text
      }
      return text.substring(0, length) + '...'
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        type: 0
      },
      downloadLoading: false
    }
  },
  created() {
    this.listQuery.type = this.$route.fullPath.endsWith('page') ? 1 : 0
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      page(this.listQuery).then(response => {
        this.list = response.data.list.map(v => {
          v.statusBool = v.status === 'Published' //  will be used when user click the cancel botton
          return v
        })
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    deleteComment(comment) {
      this.$confirm('This will permanently delete the comment. Continue?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        /* deleteComment({ id: comment.id }).then(response => {
          const index = this.list.indexOf(comment)
          if (index > -1) {
            this.list.splice(index, 1)
          }
          this.$message({
            message: 'comment deleted successfully',
            type: 'success'
          })
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })*/
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    updateStatus(row) {
      this.listLoading = true
      row.statusBool = !row.statusBool
      /* updateStatus({ commentId: row.id, status: row.statusBool ? 1 : 0 }).then(response => {
         row.status = row.statusBool ? 'Approved' : 'Pending'
         this.$message({
           message: 'Status update successfully',
           type: 'success'
         })
         // Just to simulate the time of the request
         setTimeout(() => {
           this.listLoading = false
         }, 1.5 * 1000)
       })*/
    }
  }
}
</script>
<style>

</style>
