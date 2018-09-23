let _jtreeLatestTime = 0
class AbstractNode {
  _getNow() {
    // We add this loop to restore monotonically increasing .now():
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    let time = performance.now()
    while (time <= _jtreeLatestTime) {
      time += 0.00000000001
    }
    _jtreeLatestTime = time
    return time
  }
}
