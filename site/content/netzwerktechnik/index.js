import { zahlensysteme, subnetting, protokollmodelle } from './teil1.js';
import { kabel, topologien, switching, vlan } from './teil2.js';
import { routing, natpat, vpn } from './teil3.js';
import { journeys, cases } from './szenarien.js';

export default {
  id: 'netzwerktechnik',
  title: 'Netzwerktechnik',
  short: 'NWT',
  color: '#45e3c8',
  desc: 'Von Bits und Kabeln über Subnetting bis Routing, NAT und VPN.',
  exam: { title: 'Probeklausur Netzwerktechnik', minutes: 45, count: 25 },
  topics: [zahlensysteme, subnetting, protokollmodelle, kabel, topologien, switching, vlan, routing, natpat, vpn],
  journeys,
  cases,
};
