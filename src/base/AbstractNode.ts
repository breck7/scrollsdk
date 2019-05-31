let _jtreeLatestTime = 0
let _jtreeMinTimeIncrement = 0.000000000001
abstract class AbstractNode {
  protected _getProcessTimeInMilliseconds() {
    // We add this loop to restore monotonically increasing .now():
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    let time = performance.now()
    while (time <= _jtreeLatestTime) {
      if (time === time + _jtreeMinTimeIncrement)
        // Some browsers have different return values for perf.now()
        _jtreeMinTimeIncrement = 10 * _jtreeMinTimeIncrement
      time += _jtreeMinTimeIncrement
    }
    _jtreeLatestTime = time
    return time
  }
}
