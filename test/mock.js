(() => {
  class MockDevice {
    constructor() {
      this.gatt = new MockGatt()
    }
  }

  class MockGatt {
    connect() {
      return new Promise((resolve, reject) => {
        resolve(this)
      })
    }

    getPrimaryService(uuid) {
      return new MockKonashiService()
    }
  }

  class MockKonashiService {
    constructor() {
    }

    getCharacteristic(uuid) {
      return new Promise((resolve, reject) => {
        return resolve(new MockC12c())
      })
    }
  }

  class MockC12c {
    readValue() {
      return new Promise((resolve, reject) => {
        let buff = new ArrayBuffer(1)
        buff[0] = 1
        resolve(new DataView(buff))
      })
    }

    writeValue() {
      return new Promise((resolve, reject) => {
        let buff = new ArrayBuffer(1)
        buff[0] = 1
        resolve(new DataView(buff))
      })
    }
  }

  let bluetooth = {}

  bluetooth.requestDevice = options => {
    return new Promise((resolve, reject) => {
      resolve(new MockDevice())
    })
  }

  navigator.bluetooth = bluetooth
})()
