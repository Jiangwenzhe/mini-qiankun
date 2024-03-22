class Legacy {
  constructor() {
    // 沙箱期间新增的全局变量
    this.addedPropsMapInSandbox = {};
    // 沙箱期间更新的全局变量
    this.modifiedPropsOriginalValueMapInSandbox = {};
    // 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做 snapshot
    this.currentUpdatedPropsValueMap = {};
    const rawWindow = window;
    const fakeWindow = Object.create(null);
    this.sandboxRunning = true;
    const proxy = new Proxy(fakeWindow, {
      set: (target, prop, value) => {
        // 如果是激活状态
        if (this.sandboxRunning) {
          // 判断当前window上存不存在该属性
          if (!rawWindow.hasOwnProperty(prop)) {
            // 记录新增值
            this.addedPropsMapInSandbox[prop] = value;
          } else if (!this.modifiedPropsOriginalValueMapInSandbox[prop]) {
            // 记录更新值的初始值
            const originValue = rawWindow[prop];
            this.modifiedPropsOriginalValueMapInSandbox[prop] = originValue;
          }
          // 纪录此次修改的属性
          this.currentUpdatedPropsValueMap[prop] = value;
          // 将设置的属性和值赋给了当前window，还是污染了全局window变量
          rawWindow[prop] = value;
          return true;
        }
        return true;
      },
      get: (target, prop) => {
        return rawWindow[prop];
      },
    });
    this.proxy = proxy;
  }
  active() {
    if (!this.sandboxRunning) {
      // 还原上次修改的值
      for (const key in this.currentUpdatedPropsValueMap) {
        window[key] = this.currentUpdatedPropsValueMap[key];
      }
    }

    this.sandboxRunning = true;
  }
  inactive() {
    // 将更新值的初始值还原给window
    for (const key in this.modifiedPropsOriginalValueMapInSandbox) {
      window[key] = this.modifiedPropsOriginalValueMapInSandbox[key];
    }
    // 将新增的值删掉
    for (const key in this.addedPropsMapInSandbox) {
      delete window[key];
    }

    this.sandboxRunning = false;
  }
}

// 验证：
let legacySandBox = new LegacySandBox();
legacySandBox.active();
legacySandBox.proxyWindow.city = "Beijing";
console.log("window.city-01:", window.city);
legacySandBox.inactive();
console.log("window.city-02:", window.city);
legacySandBox.active();
console.log("window.city-03:", window.city);
legacySandBox.inactive();
// 输出：
// window.city-01: Beijing
// window.city-02: undefined
// window.city-03: Beijing
