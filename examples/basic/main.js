import { HistoryRouter, HashRouter } from 'franxx'

const router = new HistoryRouter({
  basename: '/basic/',
})
window.router = router

const app = document.getElementById('app')

router
  .on('/', () => {
    console.log('home')
    app.innerHTML = `home <button onclick="router.push('/u/egoist')">go egoist</button>`
  })
  .on('/a/:b', args => {
    console.log(args)
  })
  .on('/a/:b/:c', args => {
    console.log(args, '1')
  })
  .on('/a/:b/:c/:d?', args => {
    // 按注册前后的顺序，如果现在路由是 /a/1/2，那么会被上个路由拦截到，控制台打印出1，而不是2。如果本注册和上个注册on调换下前后顺序，就会打印出2，而不是1。有个问题是：如果页面访问/a,那么此处的2也会打印出，上面的1则不会，相当于d是可选的变成了bcd都是可选的。
    console.log(args, '2')
  })

router.on('/u/:name', ({ name }) => {
  console.log(name)
  app.innerHTML = name
})

// start参数的作用：如果此处参数为/u/haha，那么访问页面的路径无论是什么，都会把/u/:name的内容打印出来
// router.start('/u/1')
router.start()
