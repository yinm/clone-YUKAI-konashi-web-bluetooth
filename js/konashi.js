'use strict'

(() => {
  const consts = {
    HIGH: 1,
    LOW: 0,
    OUTPUT: 1,
    INPUT: 0,
    PULLUP: 1,
    NO_PULLS: 0,
    ENABLE: 1,
    DISABLE: 0,
    TRUE: 1,
    FALSE: 0,
    KONASHI_SUCCESS: 0,
    KONASHI_FAILURE: -1,

    // Konashi I/O pin
    PIO0: 0,
    PIO1: 1,
    PIO2: 2,
    PIO3: 3,
    PIO4: 4,
    PIO5: 5,
    PIO6: 6,
    PIO7: 7,
    S1: 0,
    LED2: 1,
    LED3: 2,
    LED4: 3,
    LED5: 4,
    AIO0: 0,
    AIO1: 1,
    AIO2: 2,
    I2C_SDA: 6,
    I2C_SCL: 7,

    // Konashi PWM
    KONASHI_PWM_DISABLE: 0,
    KONASHI_PWM_ENABLE: 1,
    KONASHI_PWM_ENABLE_LED_MODE: 2,
    KONASHI_PWM_LED_PERIOD: 10000, // 10ms

    // Konashi analog I/O
    KONASHI_ANALOG_REFERENCE: 1300, // 1300mV

    // Konashi UART baudrate
    KONASHI_UART_RATE_2K4: 0x000a,
    KONASHI_UART_RATE_9K6: 0x0028,

    // Konashi I2C
    KONASHI_I2C_DATA_MAX_LENGTH: 18,
    KONASHI_I2C_DISABLE: 0,
    KONASHI_I2C_ENABLE: 1,
    KONASHI_I2C_ENABLE_100K: 1,
    KONASHI_I2C_ENABLE_400K: 2,
    KONASHI_I2C_STOP_CONDITION: 0,
    KONASHI_I2C_START_CONDITION: 1,
    KONASHI_I2C_RESTART_CONDITION: 2,

    // KONASHI UART
    KONASHI_UART_DATA_MAX_LENGTH: 19,
    KONASHI_UART_DISABLE: 0,
    KONASHI_UART_ENABLE: 1,

    // Konashi SPI
    KONASHI_SPI_SPEED_200K: 20,
    KONASHI_SPI_SPEED_500K: 50,
    KONASHI_SPI_SPEED_1M: 100,
    KONASHI_SPI_SPEED_2M: 200,
    KONASHI_SPI_SPEED_3M: 300,
    KONASHI_SPI_SPEED_6M: 600,

    KONASHI_SPI_MODE_CPOL0_CPHA0: 0,
    KONASHI_SPI_MODE_CPOL0_CPHA1: 1,
    KONASHI_SPI_MODE_CPOL1_CPHA0: 2,
    KONASHI_SPI_MODE_CPOL1_CPHA1: 3,
    KONASHI_SPI_MODE_DISABLE: -1,

    KONASHI_SPI_BIT_ORDER_LSB_FIRST: 0,
    KONASHI_SPI_BIT_ORDER_MSB_FIRST: 1
  }

  class Konashi {
    /**
     * Create konashi UUID
     *
     * @param {String} part 4 characters hex
     * @returns {string}
     */
    static _createUUID(part) {
      return '229b' + part + '-03fb-40da-98a7-b0def65c2d4b'
    }

    /**
     * Returns Konashi's service UUID
     *
     * @returns {String}
     */
    static get _serviceUUID() {
      return Konashi._createUUID('ff00')
    }

    /**
     * Returns konashi's UUID with label
     *
     * @returns {Object<String, String>} key: label, value: UUID
     */
    static get _c12cUUIDs() {
      return {
        analogInput: Konashi._createUUID('3008'),
        pioSetting: Konashi._createUUID('3000'),
        pioOutput: Konashi._createUUID('3002'),
        pioPullup: Konashi._createUUID('3001'),
        pioInputNotification: Konashi._createUUID('3003'),
        pwmConfig: Konashi._createUUID('3004'),
        pwmParameter: Konashi._createUUID('3005'),
        pwmDuty: Konashi._createUUID('3006'),
        analogDrive: Konashi._createUUID('3007'),
        analogRead0: Konashi._createUUID('3008'),
        analogRead1: Konashi._createUUID('3009'),
        analogRead2: Konashi._createUUID('300a'),
        i2cConfig: Konashi._createUUID('300b'),
        i2cStartStop: Konashi._createUUID('300c'),
        i2cWrite: Konashi._createUUID('300d'),
        i2cReadParameter: Konashi._createUUID('300e'),
        i2cRead: Konashi._createUUID('300f'),
        uartConfig: Konashi._createUUID('3010'),
        uartBaudRate: Konashi._createUUID('3011'),
        uartTx: Konashi._createUUID('3012'),
        uartRxNotification: Konashi._createUUID('3013'),
        hardwareReset: Konashi._createUUID('3014'),
        hardwareLowBatteryNotification: Konashi._createUUID('3015'),
      }
    }

    /**
     * Find konashi2 device
     *
     * @param {Boolean} autoConnect
     * @param {Ojbect} options default: `{filters: [{namePrefix: 'konashi2'}], optionalServices: ['229bff00-03fb-40da-98a7-b0def65c2d4b']}`
     * @returns {Promise<Konashi>}
     */
    static find(autoConnect, options) {
      if (typeof autoConnect == undefined) {
        autoConnect = true
      }
      options = options || {filters: [{namePrefix: 'konashi2'}], optionalServices: [Konashi._serviceUUID]}

      return new Promise((resolve, reject) => {
        navigator.bluetooth
          .requestDrive(options)
          .then(
            d => {
              let konashi = new Konashi(d)
              if (autoConnect) {
                konashi.connect().then(resolve, reject)
              } else {
                resolve(konashi)
              }
            },
            e => {
              reject(e)
            }
          )
      })
    }

    /**
     * constructor
     *
     * @param {BluetoothDevice} device
     */
    constructor(device) {
      // BluetoothDevice
      this._device = device
      // BluetoothGATTRemoteServer
      this._gatt = null
      // BluetoothGATTService
      this._service = null
      // Object<String, BluetoothGATTCharacteristic>
      this._c12c = {}
      // Object<String, Number>
      this._state = {pioOutputs: 0, pwmModes: 0}

      for (let key in consts) {
        this[key] = consts[key]
      }
    }

    /**
     * Connect to Konashi
     *
     * Assign `_gatt` and `_service` properties when
     * the connection has been made.
     *
     * @returns {Promise<Konashi>}
     */
    connect() {
      const that = this

      return new Promise((resolve, reject) => {
        that._device.gatt.connect()
          .then(
            gatt => {
              that._gatt = gatt
              return gatt.getPrimaryService(Konashi._serviceUUID)
            },
            e => reject(e)
          )
          .then(
            service => {
              that._service = service
              let promises = []
              let keys = []

              for (let key in Konashi._c12cUUIDs) {
                keys.push(key)
              }

              keys.forEach((label, i) => {
                promises.push(
                  that._service.getCharacteristic(Konashi._c12cUUIDs[label]).then(
                    c => {
                      // TODO: Watch changes of all characteristics
                      that._c12c[label] = c
                      Promise.resolve()
                    }
                  )
                )
              })
              return Promise.all(promises)
            },
            e => reject(e)
          )
          .then(
            () => resolve(that),
            e => reject(e)
          )
      })
    }

    // TODO
    isConnected() {
    }

    /**
     * Returns peripheral name
     *
     * @returns {String}
     */
    name() {
      return this._device.name
    }

    delay(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, ms)
      })
    }

  }
})
