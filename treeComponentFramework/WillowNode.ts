import { AbstractWillowProgram } from "./Willow"

class WillowProgram extends AbstractWillowProgram {
  constructor(baseUrl: string) {
    super(baseUrl)
    this._offlineMode = true
  }
}

export { WillowProgram }
