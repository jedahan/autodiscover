# service-js

Just some mdns, yknow

This starts a udp6 multicast listen server

Chat with

   echo -n "Hi there, IPV6!" | socat STDIO UDP6-DATAGRAM:[ff02::114%eth0]:4242
