let _scrollsdkLatestTime = 0
let _scrollsdkMinTimeIncrement = 0.000000000001
abstract class AbstractParticle {
  protected _getProcessTimeInMilliseconds() {
    // We add this loop to restore monotonically increasing .now():
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    let time = performance.now()
    while (time <= _scrollsdkLatestTime) {
      if (time === time + _scrollsdkMinTimeIncrement)
        // Some browsers have different return values for perf.now()
        _scrollsdkMinTimeIncrement = 10 * _scrollsdkMinTimeIncrement
      time += _scrollsdkMinTimeIncrement
    }
    _scrollsdkLatestTime = time
    return time
  }
}
