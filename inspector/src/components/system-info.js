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
          </tbody>
        </table>
      </div>
    )
  }
}

export default SystemInfo
