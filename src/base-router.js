import matchit from 'matchit'
import { supportPushState, getBasename } from './utils'

export default class BaseRouter {
  constructor({ basename, useHash, hashDelimiter } = {}) {
    this.routes = []
    this.handlers = {}
    this.basename = basename
    this.useHash = supportPushState ? useHash : true
    this.hashDelimiter = hashDelimiter
    if (typeof this.basename === 'undefined') {
      this.basename = getBasename(this.useHash)
    }
    if (this.useHash && !this.hashDelimiter) {
      this.hashDelimiter = '/'
    }
  }

  on(pattern, handler) {
    /**
    matchit.parse 作用：将/a/b/c/d?===>
        [{
            old: "/a/:b/:c/:d?", type: 0, val: "a"
        },{
            old: "/a/:b/:c/:d?", type: 1, val: "b"
        },{
            old: "/a/:b/:c/:d?", type: 1, val: "c"
        },{
            old: "/a/:b/:c/:d?", type: 3, val: "d"
        }]
        old - 原始路径
        0 - static静态路径
        1 - parameter
        2 - any/wildcard
        3 - optional param 可选参数
    **/
    this.routes.push(matchit.parse(pattern))
    this.handlers[pattern] = handler
    return this
  }

  off(pattern) {
    this.routes = this.routes.filter(route => route.old !== pattern)
    delete this.handlers[pattern]
    return this
  }

  find(path) {
    /**
      如果path=/a/1/2/3
      那么arr=[{
          old: "/a/:b/:c/:d?", type: 0, val: "a"
      },{
          old: "/a/:b/:c/:d?", type: 1, val: "b"
      },{
          old: "/a/:b/:c/:d?", type: 1, val: "c"
      },{
          old: "/a/:b/:c/:d?", type: 3, val: "d"
      }]
      matchit.exec(path, arr)={b: "1", c: "2", d: "3"}
      **/
    const arr = matchit.match(path, this.routes)
    if (arr.length === 0) return null
    return {
      params: matchit.exec(path, arr),
      handler: this.handlers[arr[0].old],
    }
  }

  runHandler(path) {
    const route = this.find(path)
    if (route) {
      route.handler(route.params)
    }
    return this
  }

  getActualPath(path) {
    // 当使用HistoryRouter时，如果指定了basename，需要将basename从path中删掉
    // /basic/a/1/2/3 ==>/a/1/2
    const start = path.slice(0, this.basename.length)
    if (start === this.basename) {
      return path.slice(this.basename.length) || '/'
    }
    return path
  }
}
