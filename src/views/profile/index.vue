<template>
  <div class="app-container">
    <el-form ref="userForm" :model="user" label-width="150px" class="demo-dynamic">
      <el-form-item
        prop="email"
        label="Email"
        :rules="[
          { required: true, message: 'Please input email address', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change'] }
        ]"
      >
        <el-input v-model="user.email" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updateUserProfile">Submit</el-button>
        <el-button @click="resetForm('userForm')">Reset</el-button>
      </el-form-item>
    </el-form>
    <el-form ref="passForm" :model="passForm" status-icon :rules="rules" label-width="150px">
      <el-form-item
        label="Current Password"
        prop="currentPass"
        :rules="[
          { required: true, message: 'Please input current password', trigger: 'blur' }
        ]"
      >
        <el-input v-model="passForm.currentPass" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Password" prop="pass">
        <el-input v-model="passForm.pass" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Confirm" prop="checkPass">
        <el-input v-model="passForm.checkPass" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="savePass">Submit</el-button>
        <el-button @click="resetForm('passForm')">Reset</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { profile, password } from '@/api/user'
import store from '@/store'

export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please input the password'))
      } else {
        if (this.passForm.checkPass !== '') {
          this.$refs.passForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please input the password again'))
      } else if (value !== this.passForm.pass) {
        callback(new Error('Two inputs don\'t match!'))
      } else {
        callback()
      }
    }
    return {
      user: {},
      passForm: {
        pass: '',
        checkPass: '',
        currentPass: ''
      },
      rules: {
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'userId',
      'email'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        id: this.userId,
        name: this.name,
        email: this.email
      }
    },
    updateUserProfile() {
      this.$refs['userForm'].validate((valid) => {
        if (!valid) {
          return
        }
        profile({ email: this.user.email }).then(() => {
          this.$message({
            message: 'User information has been updated successfully',
            type: 'success',
            duration: 5 * 1000
          })
          store.dispatch('user/getInfo')
        })
      })
    },
    savePass() {
      this.$refs['passForm'].validate((valid) => {
        if (!valid) {
          return
        }
        password({ oldPassword: this.passForm.currentPass, newPassword: this.passForm.pass }).then(() => {
          this.$message({
            message: 'password has been updated successfully,please re-login',
            type: 'success',
            duration: 5 * 1000
          })
          this.$store.dispatch('user/logout')
          this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        })
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
