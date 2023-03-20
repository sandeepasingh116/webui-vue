import api from '@/store/api';
import i18n from '@/i18n';
import { find } from 'lodash';

const NetworkStore = {
  namespaced: true,
  state: {
    dchpEnabledState: false,
    ipv6DchpEnabledState: false,
    ipv6AutoConfigEnabled: false,
    networkSettings: [],
    selectedInterfaceId: '', // which tab is selected
    selectedInterfaceIndex: 0, // which tab is selected
  },
  getters: {
    dchpEnabledState: (state) => state.dchpEnabledState,
    ipv6DchpEnabledState: (state) => state.ipv6DchpEnabledState,
    ipv6AutoConfigEnabled: (state) => state.ipv6AutoConfigEnabled,
    networkSettings: (state) => state.networkSettings,
    selectedInterfaceId: (state) => state.selectedInterfaceId,
    selectedInterfaceIndex: (state) => state.selectedInterfaceIndex,
  },
  mutations: {
    setDchpEnabledState: (state, dchpEnabledState) =>
      (state.dchpEnabledState = dchpEnabledState),
    setIpv6DchpEnabledState: (state, ipv6DchpEnabledState) =>
      (state.ipv6DchpEnabledState = ipv6DchpEnabledState),
    setIpv6AutoConfigEnabled: (state, ipv6AutoConfigEnabled) =>
      (state.ipv6AutoConfigEnabled = ipv6AutoConfigEnabled),
    setDomainNameState: (state, domainState) =>
      (state.domainState = domainState),
    setDnsState: (state, dnsState) => (state.dnsState = dnsState),
    setNtpState: (state, ntpState) => (state.ntpState = ntpState),
    setDomainNameStateIpv6: (state, domainStateIpv6) =>
      (state.domainStateIpv6 = domainStateIpv6),
    setDnsStateIpv6: (state, dnsState) => (state.dnsState = dnsState),
    setNtpStateIpv6: (state, ntpState) => (state.ntpState = ntpState),
    setSelectedInterfaceId: (state, selectedInterfaceId) =>
      (state.selectedInterfaceId = selectedInterfaceId),
    setSelectedInterfaceIndex: (state, selectedInterfaceIndex) =>
      (state.selectedInterfaceIndex = selectedInterfaceIndex),
    setNetworkSettings: (state, data) => {
      state.networkSettings = data.map(({ data }) => {
        const {
          DHCPv4,
          DHCPv6,
          HostName,
          Id,
          IPv4Addresses,
          IPv4StaticAddresses,
          IPv6StaticAddresses,
          IPv6Addresses,
          IPv6DefaultGateway,
          MACAddress,
          StaticNameServers,
          StatelessAddressAutoConfig,
        } = data;
        return {
          defaultGateway: IPv4StaticAddresses[0]?.Gateway, //First static gateway is the default gateway
          dhcpAddress: IPv4Addresses.filter(
            (ipv4) => ipv4.AddressOrigin === 'DHCP'
          ),
          dhcpEnabled: DHCPv4.DHCPEnabled,
          hostname: HostName,
          id: Id,
          ipv4: IPv4Addresses,
          macAddress: MACAddress,
          staticAddress: IPv4StaticAddresses[0]?.Address, // Display first static address on overview page
          staticIpv4Addresses: IPv4StaticAddresses,
          staticNameServers: StaticNameServers,
          useDnsEnabled: DHCPv4.UseDNSServers,
          useDomainNameEnabled: DHCPv4.UseDomainName,
          useNtpEnabled: DHCPv4.UseNTPServers,
          staticIpv6Addresses: IPv6StaticAddresses,
          ipv6: IPv6Addresses,
          ipv6DefaultGateway: IPv6DefaultGateway,
          ipv6OperatingMode: DHCPv6.OperatingMode,
          ipv6UseDnsEnabled: DHCPv6.UseDNSServers,
          ipv6UseDomainNameEnabled: DHCPv6.UseDomainName,
          ipv6UseNtpEnabled: DHCPv6.UseNTPServers,
          ipv6AutoConfigEnabled:
            StatelessAddressAutoConfig.IPv6AutoConfigEnabled,
        };
      });
    },
  },
  actions: {
    async getEthernetData({ commit, state }) {
      return await api
        .get('/redfish/v1/Managers/bmc/EthernetInterfaces')
        .then((response) =>
          response.data.Members.map(
            (ethernetInterface) => ethernetInterface['@odata.id']
          )
        )
        .then((ethernetInterfaceIds) =>
          api.all(
            ethernetInterfaceIds.map((ethernetInterface) =>
              api.get(ethernetInterface)
            )
          )
        )
        .then((ethernetInterfaces) => {
          const ethernetData = ethernetInterfaces.map(
            (ethernetInterface) => ethernetInterface.data
          );

          commit('setNetworkSettings', ethernetInterfaces);
          let currentInterfaceIndex = 0;
          if (state.selectedInterfaceIndex) {
            currentInterfaceIndex = state.selectedInterfaceIndex;
          }
          commit(
            'setSelectedInterfaceId',
            ethernetData[currentInterfaceIndex].Id
          );
        })
        .catch((error) => {
          console.log('Network Data:', error);
        });
    },
    async saveDomainNameState({ commit, state, dispatch }, domainState) {
      commit('setDomainNameState', domainState);
      const data = {
        DHCPv4: {
          UseDomainName: domainState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.domainName'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDomainNameState', !domainState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.domainName'),
            })
          );
        });
    },
    async saveDnsState({ commit, state, dispatch }, dnsState) {
      commit('setDnsState', dnsState);
      const data = {
        DHCPv4: {
          UseDNSServers: dnsState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDnsState', !dnsState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
    async saveNtpState({ commit, state, dispatch }, ntpState) {
      commit('setNtpState', ntpState);
      const data = {
        DHCPv4: {
          UseNTPServers: ntpState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ntp'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setNtpState', !ntpState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ntp'),
            })
          );
        });
    },
    async saveDhcpEnabledState({ commit, state, dispatch }, dhcpState) {
      commit('setDhcpEnabled', dhcpState);
      const data = {
        DHCPv4: {
          DHCPEnabled: dhcpState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dhcp'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDhcpEnabled', !dhcpState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dhcp'),
            })
          );
        });
    },
    async saveIpv6DhcpEnabledState({ commit, state, dispatch }, dhcpState) {
      commit('setIpv6DchpEnabledState', dhcpState);
      const data = {
        DHCPv6: {
          DHCPEnabled: dhcpState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dhcp'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setIpv6DchpEnabledState', !dhcpState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dhcp'),
            })
          );
        });
    },
    async saveIpv6AutoConfigState(
      { commit, state, dispatch },
      ipv6AutoConfigState
    ) {
      commit('setIpv6AutoConfigEnabled', ipv6AutoConfigState);
      const data = {
        StatelessAddressAutoConfig: {
          IPv6AutoConfigEnabled: ipv6AutoConfigState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv6AutoConfig'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setIpv6AutoConfigEnabled', !ipv6AutoConfigState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv6AutoConfig'),
            })
          );
        });
    },
    async setSelectedTabIndex({ commit }, tabIndex) {
      commit('setSelectedInterfaceIndex', tabIndex);
    },
    async setSelectedTabId({ commit }, tabId) {
      commit('setSelectedInterfaceId', tabId);
    },
    async updateIpv4Address({ dispatch, state }, newIpv4Address) {
      const originalAddresses =
        state.networkSettings[state.selectedInterfaceIndex].staticIpv4Addresses;
      const updatedIpv4 = originalAddresses.map((item) => {
        const address = item.Address;
        if (find(newIpv4Address, { Address: address })) {
          console.log('true', newIpv4Address);
          return null; // if address matches then delete address to "edit"
        } else {
          return {}; // if address doesn't match then skip address, no change
        }
      });
      // console.log("updatedIpv4", updatedIpv4);
      const filteredAddress = newIpv4Address.filter(
        (item) => item.Subnet !== ''
      );
      console.log('filteredAddress', filteredAddress);
      const updatedIpv4Array = {
        IPv4StaticAddresses: [...updatedIpv4, ...filteredAddress],
      };
      console.log('updatedIpv4Array', updatedIpv4Array);
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          updatedIpv4Array
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async updateIpv6Address({ dispatch, state }, newIpv6Address) {
      const originalAddresses =
        state.networkSettings[state.selectedInterfaceIndex].staticIpv6Addresses;
      console.log('originalAddresses', originalAddresses);
      const updatedIpv6 = originalAddresses.map((item) => {
        const address = item.Address;
        console.log('address', address);
        console.log(find(newIpv6Address, { Address: address }));
        if (find(newIpv6Address, { Address: address })) {
          return null; // if address matches then delete address to "edit"
        } else {
          return {}; // if address doesn't match then skip address, no change
        }
      });
      console.log('updatedIpv6', updatedIpv6);
      const filteredAddress = newIpv6Address.filter(
        (item) => item.PrefixLength !== 0
      );
      const updatedIpv6Array = {
        IPv6StaticAddresses: [...updatedIpv6, ...filteredAddress],
      };

      console.log('updatedIpv6Array', updatedIpv6Array.PrefixLength);
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          updatedIpv6Array
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv6'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv6'),
            })
          );
        });
    },
    async deleteIpv4Address({ dispatch, state }, updatedIpv4Array) {
      const originalAddressArray =
        state.networkSettings[state.selectedInterfaceIndex].staticIpv4Addresses;
      const newIpv4Array = originalAddressArray.map((item) => {
        const address = item.Address;
        if (find(updatedIpv4Array, { Address: address })) {
          return {}; //return addresses that match the updated array
        } else {
          return null; // delete address that do not match updated array
        }
      });

      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv4StaticAddresses: newIpv4Array }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async deleteIpv6Address({ dispatch, state }, updatedIpv6Array) {
      const originalAddressArray =
        state.networkSettings[state.selectedInterfaceIndex].staticIpv6Addresses;
      const newIpv6Array = originalAddressArray.map((item) => {
        const address = item.Address;
        if (find(updatedIpv6Array, { Address: address })) {
          return {}; //return addresses that match the updated array
        } else {
          return null; // delete address that do not match updated array
        }
      });

      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv6StaticAddresses: newIpv6Array }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async saveHostname({ state, dispatch }, hostname) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          hostname
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.network'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.network'),
            })
          );
        });
    },
    async saveDnsAddress({ dispatch, state }, dnsForm) {
      const newAddress = dnsForm;
      const originalAddresses =
        state.networkSettings[state.selectedInterfaceIndex].staticNameServers;
      const newDnsArray = originalAddresses.concat(newAddress);
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: newDnsArray }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
    async editDnsAddress({ dispatch, state }, dnsTableData) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: dnsTableData }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
  },
};

export default NetworkStore;
