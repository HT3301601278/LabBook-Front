import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 修复Vue Router 3.0+版本中频繁点击同一路由导致的NavigationDuplicated错误
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    name: 'Manager',
    component: () => import('../views/Manager.vue'),
    // 根据用户角色动态重定向到对应的首页
    redirect: to => {
      const user = JSON.parse(localStorage.getItem("labuser") || '{}');
      if (user.role === 'ADMIN') {
        return '/adminHome';
      } else if (user.role === 'LABADMIN') {
        return '/labadminHome';
      } else {
        return '/studentHome';
      }
    },
    children: [
      // ==================== 通用错误页面 ====================
      {
        path: '403',
        name: 'NoAuth',
        meta: { name: '无权限', title: '无权限' },
        component: () => import('../views/common/403.vue')
      },

      // ==================== 系统管理员模块 ====================
      // 系统管理员首页
      {
        path: 'adminHome',
        name: 'AdminHome',
        meta: { name: '系统首页', title: '系统首页' },
        component: () => import('../views/admin/AdminHome.vue')
      },
      // 管理员管理
      {
        path: 'admin',
        name: 'Admin',
        meta: { name: '管理员', title: '管理员' },
        component: () => import('../views/admin/Admin.vue')
      },
      // 管理员个人信息
      {
        path: 'adminPerson',
        name: 'AdminPerson',
        meta: { name: '个人信息', title: '个人信息' },
        component: () => import('../views/admin/AdminPerson.vue')
      },

      // ==================== 实验室管理员模块 ====================
      // 实验室管理员首页
      {
        path: 'labadminHome',
        name: 'LabadminHome',
        meta: { name: '系统首页', title: '系统首页' },
        component: () => import('../views/labadmin/LabadminHome.vue')
      },
      // 实验室管理员管理
      {
        path: 'labadmin',
        name: 'Labadmin',
        meta: { name: '实验室管理员', title: '实验室管理员' },
        component: () => import('../views/labadmin/Labadmin.vue')
      },
      // 实验室管理员个人信息
      {
        path: 'labadminPerson',
        name: 'LabadminPerson',
        meta: { name: '个人信息', title: '个人信息' },
        component: () => import('../views/labadmin/LabadminPerson.vue')
      },

      // ==================== 实验室管理模块 ====================
      // 实验室分类管理
      {
        path: 'type',
        name: 'Type',
        meta: { name: '实验室分类', title: '实验室分类' },
        component: () => import('../views/manager/Type.vue')
      },
      // 实验室基本信息管理
      {
        path: 'lab',
        name: 'Lab',
        meta: { name: '实验室信息', title: '实验室信息' },
        component: () => import('../views/manager/Lab.vue')
      },
      // 学生实验室信息查看
      {
        path: 'studentLab',
        name: 'StudentLab',
        meta: { name: '实验室信息', title: '实验室信息' },
        component: () => import('../views/student/StudentLab.vue')
      },
      // 实验室预约记录管理
      {
        path: 'reserve',
        name: 'Reserve',
        meta: { name: '预约记录', title: '预约记录' },
        component: () => import('../views/manager/Reserve.vue')
      },
      // 实验室报修记录管理
      {
        path: 'fix',
        name: 'Fix',
        meta: { name: '报修记录', title: '报修记录' },
        component: () => import('../views/manager/Fix.vue')
      },
      // 实验室检修记录管理
      {
        path: 'checks',
        name: 'Check',
        meta: { name: '检修记录', title: '检修记录' },
        component: () => import('../views/manager/Check.vue')
      },

      // ==================== 学生用户模块 ====================
      // 学生首页
      {
        path: 'studentHome',
        name: 'StudentHome',
        meta: { name: '系统首页', title: '系统首页' },
        component: () => import('../views/student/StudentHome.vue')
      },
      // 学生管理
      {
        path: 'student',
        name: 'Student',
        meta: { name: '学生', title: '学生' },
        component: () => import('../views/student/Student.vue')
      },
      // 学生个人信息
      {
        path: 'studentPerson',
        name: 'StudentPerson',
        meta: { name: '个人信息', title: '个人信息' },
        component: () => import('../views/student/StudentPerson.vue')
      },

      // ==================== 公共功能模块 ====================
      // 密码修改
      {
        path: 'password',
        name: 'Password',
        meta: { name: '修改密码', title: '修改密码' },
        component: () => import('../views/common/Password.vue')
      },
      // 公告信息
      {
        path: 'notice',
        name: 'Notice',
        meta: { name: '公告信息', title: '公告信息' },
        component: () => import('../views/common/Notice.vue')
      }
    ]
  },
  // ==================== 认证相关路由 ====================
  // 用户登录
  {
    path: '/login',
    name: 'Login',
    meta: { name: '登录', title: '登录' },
    component: () => import('../views/common/Login.vue')
  },
  // 用户注册
  {
    path: '/register',
    name: 'Register',
    meta: { name: '注册', title: '注册' },
    component: () => import('../views/common/Register.vue')
  },
  // 404页面 - 处理所有未匹配的路由
  {
    path: '*',
    name: 'NotFound',
    meta: { name: '无法访问', title: '404' },
    component: () => import('../views/common/404.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 全局路由守卫 - 处理页面访问权限和页面标题
router.beforeEach((to, from, next) => {
  // 设置动态页面标题
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = '实验室预约管理系统';
  }

  // 获取当前登录用户信息
  let user = JSON.parse(localStorage.getItem("labuser") || '{}');
  // 定义无需登录即可访问的公共路径
  const publicPaths = ['/login', '/register'];

  // 处理公共路径访问逻辑
  if (publicPaths.includes(to.path)) {
    if (user.token) {
      // 已登录用户访问登录/注册页面时，重定向到对应角色的首页
      if (user.role === 'STUDENT') {
        next('/studentHome');
      } else if (user.role === 'ADMIN') {
        next('/adminHome');
      } else if (user.role === 'LABADMIN') {
        next('/labadminHome');
      }
    } else {
      // 未登录用户允许访问公共页面
      next();
    }
    return;
  }

  // 非公共页面的访问控制 - 未登录用户重定向到登录页
  if (!user.token) {
    next('/login');
    return;
  }

  // 已登录且访问受保护页面，允许通过
  next();
});

export default router
