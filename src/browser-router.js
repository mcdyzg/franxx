import BaseRouter from './base-router'
import {
  supportPushState,
  pushState,
  pushHash,
  removeLeadingSlash,
} from './utils'

export default class BrowserRouter extends BaseRouter {
  getPath() {
    if (this.useHash) {
      return window.location.hash
        ? '/' + window.location.hash.slice(this.hashDelimiter.length + 1)
        : null
    }
    return this.getActualPath(window.location.pathname)
  }

  link(path) {
    let link
    if (supportPushState) {
      link =
        this.basename +
        (this.useHash ? `#${this.hashDelimiter}` : '') +
        removeLeadingSlash(path)
    } else {
      // Only location.hash part is needed
      // The basename won't matter if we're not using hash
      link = `#${this.hashDelimiter}${removeLeadingSlash(path)}`
    }
    return link
  }

  push(path, replace) {
    // 当浏览器支持history api时，不论是哪种模式均使用pushState改变路由，然后手动触发回调。这样只有在浏览器前进后退或者go,back时才会执行popstate绑定的回调。
    // 当浏览器不支持history api是，改变hash，然后由hashchange绑定的回调触发runHandler
    if (supportPushState) {
      pushState(this.link(path), replace)
      this.runHandler(path)
    } else {
      pushHash(this.link(path), replace)
      // No need to run handler since we listen to `hashchange` event
    }
    return this
  }

  // Only supported when `window.history` is available
  go(n) {
    window.history.go(n)
    return this
  }

  replace(path) {
    return this.push(path, true)
  }

  start(path) {
    path = path || this.getPath()
    // 只要支持history Api，就使用popstate做前进,后退,go,back的监听，如果不支持，才是用hashchange监听
    window.addEventListener(
      supportPushState ? 'popstate' : 'hashchange',
      () => {
        this.runHandler(this.getPath())
      },
    )

    if (path) {
      this.runHandler(path)
    } else if (this.useHash) {
      this.push('/')
    }
  }
}
