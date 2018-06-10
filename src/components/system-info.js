import React, { Component } from 'react'
import Konashi from '../konashi.js'

class SystemInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      device: undefined,
      deviceName: '',
      isConnected: false,
    }

    this.handleClick = this.handleClick.bind(this)
    this.startPio = this.startPio.bind(this)
  }

  handleClick() {
    if (this.state.isConnected) {
      this.state.device.disconnect()
      this.setState({
        deviceName: '',
        isConnected: false,
      })
    } else {
      Konashi.find(true).then((k) => {
        const name = k.name()
        this.setState({
          device: k,
          deviceName: name,
          isConnected: true,
        })
      })
    }
  }

  startPio() {
    if (this.state.device === undefined) {
      return
    }

    const k = this.state.device
    k.pinMode(k.PIO0, k.INPUT)
      .then(() => k.pinMode(k.PIO1, k.OUTPUT))
      .then(() => k.pinMode(k.PIO2, k.OUTPUT))
      .then(() => k.pinMode(k.PIO3, k.OUTPUT))
      .then(() => k.pinMode(k.PIO4, k.OUTPUT))
      .then(() => {
        let i = 0
        let cancelRead = false
        let timeline = [
          [k.PIO1, k.HIGH],
          [k.PIO1, k.LOW],
          [k.PIO2, k.HIGH],
          [k.PIO2, k.LOW],
          [k.PIO3, k.HIGH],
          [k.PIO3, k.LOW],
          [k.PIO4, k.HIGH],
          [k.PIO4, k.LOW]
        ]

        setInterval(() => {
          cancelRead = true
          if (timeline.length <= i) {
            i = 0
          }

          let values = timeline[i]
          k.digitalWrite(values[0], values[1]).then(() => {
            cancelRead = false
          })

          i++
        }, 200)
      })
  }

  render() {
    return (
      <div>
        <h2>System info</h2>
        <button onClick={this.handleClick}>{this.state.isConnected ? 'DISCONNECT' : 'CONNECT'}</button>
        <table>
          <tbody>
          <tr>
            <td>Device Name:</td>
            <td>{this.state.deviceName}</td>
          </tr>
          <tr>
            <td>PIO</td>
            <td><button onClick={this.startPio}>start</button></td>
          </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default SystemInfo
