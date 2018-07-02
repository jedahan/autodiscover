const pickPort = require('pick-port')
const os = require('os')
const dgram = require('dgram')

// return link-local addresses
const linklocal = () => {
  const interfaces = os.networkInterfaces()

  return Object.entries(interfaces)
    .filter(([_, addrs]) => addrs.some(({address}) => address.startsWith('fe80')))
    .map(([iface, _]) => iface)
}

const listen = async () => {
  const linkLocalServiceMap = {
    SSDP: {
      multicastAddress: `ff02::c`,
      port: 1900
    },
    mDNS: {
      multicastAddress: `ff02::fb`,
      port: 5353
    },
    experimental: {
      multicastAddress: `ff02::114`,
      port: 4242
    }
  }
  const { multicastAddress, port } = linkLocalServiceMap[`experimental`]
  const format = ({address, port}) => `[${address}]:${port}`

  for (let iface of linklocal()) {
    const socket = dgram.createSocket({type: 'udp6', reuseAddr: true})

    const local = {
      address: `::%${iface}`,
      port
    }

    console.log(`listening on ${local.address}:${local.port}`)

    socket.on('message', (msg, remote) => {
      console.log(`${format(local)} <- ${format(remote)} | ${msg}`)
    })

    socket.bind(port, '::', () => {
      socket.setMulticastLoopback(true)
      socket.setMulticastInterface(local.address)
      socket.addMembership(multicastAddress, local.address)
      // const message = Buffer.from(`my cool invite`)
      // socket.send(message, 0, message.length, port)
    })
  }
}

listen()
