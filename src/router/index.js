import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决导航栏或者底部导航tabBar中的vue-router在3.0版本以上频繁点击菜单报错的问题。
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    name: 'Manager',
    component: () => import('../views/Manager.vue'),
    redirect: '/studentHome',  // 默认重定向到学生首页
    children: [
      { path: '403', name: 'NoAuth', meta: { name: '无权限', title: '无权限' }, component: () => import('../views/manager/403') },
      { path: 'adminHome', name: 'AdminHome', meta: { name: '系统首页', title: '系统首页' }, component: () => import('../views/manager/AdminHome') },
      { path: 'labadminHome', name: 'LabadminHome', meta: { name: '系统首页', title: '系统首页' }, component: () => import('../views/manager/LabadminHome') },
      { path: 'studentHome', name: 'StudentHome', meta: { name: '系统首页', title: '系统首页' }, component: () => import('../views/manager/StudentHome') },
      { path: 'admin', name: 'Admin', meta: { name: '管理员', title: '管理员' }, component: () => import('../views/manager/Admin') },
      { path: 'adminPerson', name: 'AdminPerson', meta: { name: '个人信息', title: '个人信息' }, component: () => import('../views/manager/AdminPerson') },
      { path: 'labadminPerson', name: 'LabadminPerson', meta: { name: '个人信息', title: '个人信息' }, component: () => import('../views/manager/LabadminPerson') },
      { path: 'studentPerson', name: 'StudentPerson', meta: { name: '个人信息', title: '个人信息' }, component: () => import('../views/manager/StudentPerson') },
      { path: 'password', name: 'Password', meta: { name: '修改密码', title: '修改密码' }, component: () => import('../views/manager/Password') },
      { path: 'notice', name: 'Notice', meta: { name: '公告信息', title: '公告信息' }, component: () => import('../views/manager/Notice') },
      { path: 'labadmin', name: 'Labadmin', meta: { name: '实验室管理员', title: '实验室管理员' }, component: () => import('../views/manager/Labadmin') },
      { path: 'student', name: 'Student', meta: { name: '学生', title: '学生' }, component: () => import('../views/manager/Student') },
      { path: 'type', name: 'Type', meta: { name: '实验室分类', title: '实验室分类' }, component: () => import('../views/manager/Type') },
      { path: 'lab', name: 'Lab', meta: { name: '实验室信息', title: '实验室信息' }, component: () => import('../views/manager/Lab') },
      { path: 'labStudent', name: 'LabStudent', meta: { name: '实验室信息', title: '实验室信息' }, component: () => import('../views/manager/LabStudent') },
      { path: 'reserve', name: 'Reserve', meta: { name: '预约记录', title: '预约记录' }, component: () => import('../views/manager/Reserve') },
      { path: 'fix', name: 'Fix', meta: { name: '报修记录', title: '报修记录' }, component: () => import('../views/manager/Fix') },
      { path: 'checks', name: 'Check', meta: { name: '检修记录', title: '检修记录' }, component: () => import('../views/manager/Check') },
    ]
  },
  {
    path: '/front',
    name: 'Front',
    component: () => import('../views/Front.vue'),
    children: [
      { path: 'home', name: 'Home', meta: { name: '系统首页', title: '首页' }, component: () => import('../views/front/Home') },
      { path: 'person', name: 'Person', meta: { name: '个人信息', title: '个人信息' }, component: () => import('../views/front/Person') },
    ]
  },
  { path: '/login', name: 'Login', meta: { name: '登录', title: '登录' }, component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', meta: { name: '注册', title: '注册' }, component: () => import('../views/Register.vue') },
  { path: '*', name: 'NotFound', meta: { name: '无法访问', title: '404' }, component: () => import('../views/404.vue') },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = '实验室预约管理系统';
  }

  let user = JSON.parse(localStorage.getItem("labuser") || '{}');
  const publicPaths = ['/login', '/register'];
  if (publicPaths.includes(to.path)) {
    if (user.token) {
      next('/');
    } else {
      next();
    }
    return;
  }
  if (!user.token) {
    next('/login');
    return;
  }
  if (to.path === '/') {
    if (user.role === 'STUDENT') {
      next('/front/home');
    } else if (user.role === 'ADMIN') {
      next('/adminHome');
    } else if (user.role === 'LABADMIN') {
      next('/labadminHome');
    } else {
      next('/studentHome');
    }
    return;
  }
  next();
});

export default router
