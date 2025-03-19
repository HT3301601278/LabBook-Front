<template>
  <div>
    <el-dialog title="预约实验室" :visible.sync="visible" width="40%" :close-on-click-modal="false" destroy-on-close :append-to-body="true">
      <el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
        <el-form-item label="实验室信息" v-if="form.labName">
          <div>{{ form.labName }} - {{ form.descr }}</div>
        </el-form-item>
        <el-form-item prop="reserveStartTime" label="开始时间">
          <el-date-picker
            v-model="form.reserveStartTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="startTimeOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="reserveEndTime" label="结束时间">
          <el-date-picker
            v-model="form.reserveEndTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="endTimeOptions">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ReserveForm",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    labInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 验证结束时间必须大于开始时间
    const validateEndTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择结束时间'));
      }
      if (!this.form.reserveStartTime) {
        return callback(new Error('请先选择开始时间'));
      }
      const startTime = new Date(this.form.reserveStartTime).getTime();
      const endTime = new Date(value).getTime();
      if (endTime <= startTime) {
        return callback(new Error('结束时间必须大于开始时间'));
      }
      
      // 计算时间差（毫秒）
      const diffMs = endTime - startTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // 检查是否超过最大预约时长
      if (diffHours > this.maxHours) {
        return callback(new Error(`预约时长不能超过${this.maxHours}小时`));
      }
      
      callback();
    };
    
    return {
      form: {
        labId: '',
        labadminId: '',
        studentId: '',
        reserveStartTime: '',
        reserveEndTime: '',
        labName: '',
        descr: ''
      },
      rules: {
        reserveStartTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        reserveEndTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' },
          { validator: validateEndTime, trigger: 'change' }
        ]
      },
      startTimeOptions: {
        disabledDate: (time) => {
          // 禁用今天之前的日期
          return time.getTime() < Date.now() - 8.64e7; // 8.64e7是一天的毫秒数
        }
      },
      endTimeOptions: {
        disabledDate: (time) => {
          // 禁用今天之前的日期
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      maxHours: 4, // 默认最大预约时长
      user: JSON.parse(localStorage.getItem('labuser') || '{}')
    };
  },
  watch: {
    labInfo: {
      handler(val) {
        if (val && val.id) {
          this.form.labId = val.id;
          this.form.labadminId = val.labadminId;
          this.form.studentId = this.user.id;
          this.form.labName = val.name;
          this.form.descr = val.descr;
          this.maxHours = val.maxReservationHours || 4;
        }
      },
      immediate: true
    }
  },
  methods: {
    submit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const data = {
            labId: this.form.labId,
            labadminId: this.form.labadminId,
            studentId: this.form.studentId,
            reserveStartTime: this.form.reserveStartTime,
            reserveEndTime: this.form.reserveEndTime,
            status: '待审核',
            dostatus: '待审核'
          };
          
          this.$request.post('/reserve/add', data).then(res => {
            if (res.code === '200') {
              this.$message.success('预约申请提交成功，等待管理员审核');
              this.$emit('success');
              this.$emit('update:visible', false);
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    },
    cancel() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style scoped>
</style>