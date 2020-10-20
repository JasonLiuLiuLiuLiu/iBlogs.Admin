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
      <el-table-column label="Created" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.created|timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ContentId" width="70px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.cid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Author" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Email" width="200px">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Url" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Ip" width="200px">
        <template slot-scope="{row}">
          <span>{{ row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Agent" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.agent|longTextFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Content" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" class-name="status-col" align="center" width="200">
        <template slot-scope="{row}">
          <el-switch
            v-model="row.statusBool"
            @change="updateStatus(row)"
          />
          <el-tag :type="row.status | statusFilter" class="statusTag">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="warning" size="mini" @click="deleteComment(row)">
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
  </div>
</template>

<script>
import { page, deleteComment, updateStatus } from '@/api/comment'
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
        'Approved': 'success',
        'Pending': 'danger'
      }
      return statusMap[status]
    },
    statusBoolFilter(status) {
      return status === 'Approved'
    },
    timeFilter(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },
    longTextFilter(text) {
      if (text.length < 10) {
        return text
      }
      return text.substring(0, 10) + '...'
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
        pageSize: 20
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      page(this.listQuery).then(response => {
        this.list = response.data.list.map(v => {
          v.statusBool = v.status === 'Approved' //  will be used when user click the cancel botton
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
        deleteComment({ id: comment.id }).then(response => {
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
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    updateStatus(row) {
      this.listLoading = true
      updateStatus({ commentId: row.id, status: row.statusBool ? 1 : 0 }).then(response => {
        row.status = row.statusBool ? 'Approved' : 'Pending'
        this.$message({
          message: 'Status update successfully',
          type: 'success'
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    }
  }
}
</script>
<style>
.statusTag {
  margin-left: 10px;
}
</style>
