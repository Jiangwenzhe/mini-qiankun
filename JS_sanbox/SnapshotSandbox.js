class SnapshotSandBox {
  windowSnapshot = {};
  modifyPropsMap = {};
  active() {
    for (const props in window) {
      this.windowSnapshot[props] = window[props];
    }
    Object.keys(this.modifyPropsMap).forEach((prop) => {
      window[prop] = this.modifyPropsMap[prop];
    });
  }
  inactive() {
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    }
  }
}

let snapshotSandBox = new SnapshotSandBox();
snapshotSandBox.active();
window.city = "Beijing";
console.log("window.city-01:", window.city);
snapshotSandBox.inactive();
console.log("window.city-02:", window.city);
snapshotSandBox.active();
console.log("window.city-03:", window.city);
snapshotSandBox.inactive();
