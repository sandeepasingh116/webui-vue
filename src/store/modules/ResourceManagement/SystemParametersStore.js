import api from '@/store/api';
import i18n from '@/i18n';

const systemParametersStore = {
  namespaced: true,
  state: {
    rpdPolicyOptions: [],
    aggressivePrefetch: false,
    frequencyCap: null,
    frequencyRequestCurrentToggle: false,
    lateralCastOutMode: null,
    immediateTestRequested: false,
    gardOnError: false,
    rpdPolicy: null,
    rpdScheduledRun: null,
  },
  getters: {
    aggressivePrefetch: (state) => state.aggressivePrefetch,
    frequencyMax: (state) => state.frequencyCap?.frequencyMax,
    frequencyMin: (state) => state.frequencyCap?.frequencyMin,
    frequencyRequest: (state) => state.frequencyCap?.frequencyRequest,
    frequencyRequestCurrent: (state) =>
      state.frequencyCap?.frequencyRequestCurrent,
    frequencyRequestCurrentToggle: (state) =>
      state.frequencyRequestCurrentToggle,
    lateralCastOutMode: (state) => state.lateralCastOutMode,
    immediateTestRequested: (state) => state.immediateTestRequested,
    gardOnError: (state) => state.gardOnError,
    rpdPolicy: (state) => state.rpdPolicy,
    rpdPolicyOptions: (state) => state.rpdPolicyOptions,
    rpdScheduledRun: (state) => state.rpdScheduledRun,
  },
  mutations: {
    setFrequencyRequestCurrentToggle: (state, frequencyRequestCurrentToggle) =>
      (state.frequencyRequestCurrentToggle = frequencyRequestCurrentToggle),
    setAggressivePrefetch: (state, aggressivePrefetch) =>
      (state.aggressivePrefetch = aggressivePrefetch),
    setFrequencyCap: (state, frequencyCap) =>
      (state.frequencyCap = frequencyCap),
    setLateralCastOutMode: (state, lateralCastOutMode) =>
      (state.lateralCastOutMode = lateralCastOutMode),
    setImmediateTestRequested: (state, immediateTestRequested) =>
      (state.immediateTestRequested = immediateTestRequested),
    setGardOnError: (state, gardOnError) => (state.gardOnError = gardOnError),
    setRpdPolicy: (state, rpdPolicy) => (state.rpdPolicy = rpdPolicy),
    setRpdPolicyOptions: (state, rpdPolicyOptions) =>
      (state.rpdPolicyOptions = rpdPolicyOptions),
    setRpdScheduledRun: (state, rpdScheduledRun) =>
      (state.rpdScheduledRun = rpdScheduledRun),
  },
  actions: {
    async getAggressivePrefetch({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const aggressivePrefetch = RegistryEntries.Attributes.filter(
            (Attribute) =>
              Attribute.AttributeName == 'hb_proc_favor_aggressive_prefetch'
          );
          let aggressivePrefetchValue = aggressivePrefetch[0].CurrentValue;
          let modeValue = aggressivePrefetchValue == 'Enabled' ? true : false;
          commit('setAggressivePrefetch', modeValue);
        })
        .catch((error) => console.log(error));
    },
    async getRpdPolicy({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdPolicy = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_policy'
          );
          let rpdPolicyValue = rpdPolicy[0].CurrentValue;
          commit('setRpdPolicy', rpdPolicyValue);
        })
        .catch((error) => console.log(error));
    },
    async getImmediateTestRequested({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const immediateTestRequested = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_immediate_test'
          );
          let immediateTestRequestedValue =
            immediateTestRequested[0].CurrentValue;
          let modeValue =
            immediateTestRequestedValue == 'Enabled' ? true : false;
          commit('setImmediateTestRequested', modeValue);
        })
        .catch((error) => console.log(error));
    },
    async getGardOnError({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const immediateTestRequested = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_gard_policy'
          );
          let immediateTestRequestedValue =
            immediateTestRequested[0].CurrentValue;
          let modeValue =
            immediateTestRequestedValue == 'Enabled' ? true : false;
          commit('setGardOnError', modeValue);
        })
        .catch((error) => console.log(error));
    },
    async getRpdPolicyOptions({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdPolicy = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_policy'
          );
          let rpdPolicyOptions = rpdPolicy[0].Value.map(
            ({ ValueName }) => ValueName
          );
          commit('setRpdPolicyOptions', rpdPolicyOptions);
        })
        .catch((error) => console.log(error));
    },
    async getRpdScheduledRun({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdScheduledRun = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_scheduled_tod'
          );
          let RpdScheduledRunValue = rpdScheduledRun[0].CurrentValue;
          commit('setRpdScheduledRun', RpdScheduledRunValue);
        })
        .catch((error) => console.log(error));
    },
    async saveAggressivePrefetch({ commit }, updatedAggressivePrefetch) {
      let updatedModeValue = updatedAggressivePrefetch ? 'Enabled' : 'Disabled';
      commit('setAggressivePrefetch', updatedAggressivePrefetch);
      const updatedAggressivePrefetchValue = {
        Attributes: { hb_proc_favor_aggressive_prefetch: updatedModeValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedAggressivePrefetchValue
        )
        .then(() => {
          return i18n.t(
            'pageSystemParameters.toast.successSavingAggressivePrefetch'
          );
        })
        .catch((error) => {
          console.log(error);
          commit('setAggressivePrefetch', !updatedAggressivePrefetch);
          throw new Error(
            i18n.t('pageSystemParameters.toast.errorSavingAggressivePrefetch')
          );
        });
    },
    async saveRpdPolicy({ commit }, rpdPolicyValue) {
      const updatedRpdPolicyValue = {
        Attributes: { pvm_rpd_policy: rpdPolicyValue },
      };
      return await api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedRpdPolicyValue
        )
        .then(() => {
          commit(
            'setRpdPolicy',
            updatedRpdPolicyValue.Attributes.pvm_rpd_policy
          );
          return i18n.t('pageSystemParameters.toast.successSavingRpdPolicy');
        })
        .catch((error) => {
          console.log('error', error);
          throw new Error(
            i18n.t('pageSystemParameters.toast.errorSavingRpdPolicy')
          );
        });
    },
    async saveImmediateTestRequested(
      { commit },
      updatedImmediateTestRequested
    ) {
      let updatedValue = updatedImmediateTestRequested ? 'Enabled' : 'Disabled';
      commit('setImmediateTestRequested', updatedImmediateTestRequested);
      const updatedImmediateTestRequestedValue = {
        Attributes: { pvm_rpd_immediate_test: updatedValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedImmediateTestRequestedValue
        )
        .then(() => {
          return i18n.t(
            'pageSystemParameters.toast.successSavingImmediateTestRequested'
          );
        })
        .catch((error) => {
          console.log(error);
          commit('setImmediateTestRequested', !updatedImmediateTestRequested);
          throw new Error(
            i18n.t(
              'pageSystemParameters.toast.errorSavingImmediateTestRequested'
            )
          );
        });
    },
    async saveGardOnError({ commit }, updatedImmediateTestRequested) {
      let updatedValue = updatedImmediateTestRequested ? 'Enabled' : 'Disabled';
      commit('setGardOnError', updatedImmediateTestRequested);
      const updatedImmediateTestRequestedValue = {
        Attributes: { pvm_rpd_gard_policy: updatedValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedImmediateTestRequestedValue
        )
        .then(() => {
          return i18n.t('pageSystemParameters.toast.successSavingGardOnError');
        })
        .catch((error) => {
          console.log(error);
          commit('setGardOnError', !updatedImmediateTestRequested);
          throw new Error(
            i18n.t('pageSystemParameters.toast.errorSavingGardOnError')
          );
        });
    },
    async saveRpdScheduledRun({ commit }) {
      const updatedIoEnlargedCapacity = {
        Attributes: {
          pvm_rpd_scheduled_tod: this.state.systemParameters.rpdScheduledRun,
        },
      };
      return await api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedIoEnlargedCapacity
        )
        .then(() => {
          commit(
            'setRpdScheduledRun',
            updatedIoEnlargedCapacity.Attributes.pvm_rpd_scheduled_tod
          );
          return i18n.t(
            'pageMemory.toast.successSavingAdapterEnlargedCapacity'
          );
        })
        .catch((error) => {
          console.log('error', error);
          throw new Error(
            i18n.t('pageMemory.toast.errorSavingAdapterEnlargedCapacity')
          );
        });
    },
    async getLateralCastOutMode({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const lateralCastOutMode = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'hb_lateral_cast_out_mode'
          );
          let lateralCastOutModeValue = lateralCastOutMode[0].CurrentValue;
          let modeValue = lateralCastOutModeValue == 'Enabled' ? true : false;
          commit('setLateralCastOutMode', modeValue);
        })
        .catch((error) => console.log(error));
    },
    async saveLateralCastOutMode({ commit }, lateralCastOutModeValue) {
      let updatedModeValue = lateralCastOutModeValue ? 'Enabled' : 'Disabled';
      commit('setLateralCastOutMode', lateralCastOutModeValue);
      const updatedLateralCastOutMode = {
        Attributes: { hb_lateral_cast_out_mode: updatedModeValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedLateralCastOutMode
        )
        .then(() => {
          return i18n.t(
            'pageSystemParameters.toast.successSavingLateralCastOut'
          );
        })
        .catch((error) => {
          console.log(error);
          commit('setLateralCastOutMode', !lateralCastOutModeValue);
          throw new Error(
            i18n.t('pageSystemParameters.toast.errorSavingLateralCastOut')
          );
        });
    },
    async getFrequencyCap({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Bios')
        .then(({ data: { Attributes } }) => {
          const frequencyCapData = {
            frequencyMax: Attributes.hb_cap_freq_mhz_max,
            frequencyMin: Attributes.hb_cap_freq_mhz_min,
            frequencyRequest: Attributes.hb_cap_freq_mhz_request,
            frequencyRequestCurrent: Attributes.hb_cap_freq_mhz_request_current,
          };

          commit('setFrequencyCap', frequencyCapData);

          if (frequencyCapData.frequencyRequest == 0) {
            commit('setFrequencyRequestCurrentToggle', false);
          } else {
            commit('setFrequencyRequestCurrentToggle', true);
          }
        })
        .catch((error) => console.log(error));
    },
    async saveFrequencyCap({ commit, dispatch }, { frequency, state }) {
      if (state) {
        commit('setFrequencyRequestCurrentToggle', true);
      } else {
        commit('setFrequencyRequestCurrentToggle', false);
      }
      return dispatch('newFrequencyCapRequest', frequency);
    },

    async newFrequencyCapRequest({ commit, dispatch }, frequency) {
      const newFrequencyRequest = {
        Attributes: { hb_cap_freq_mhz_request: frequency },
      };
      return api
        .patch('/redfish/v1/Systems/system/Bios/Settings', newFrequencyRequest)
        .then(() => {
          dispatch('getFrequencyCap');
          return i18n.t('pageSystemParameters.toast.successSavingFrequencyCap');
        })
        .catch((error) => {
          if (frequency == 0) {
            commit('setFrequencyRequestCurrentToggle', false);
          } else {
            commit('setFrequencyRequestCurrentToggle', true);
          }
          console.log(error);
          throw new Error(
            i18n.t('pageSystemParameters.toast.errorSavingFrequencyCap')
          );
        });
    },
  },
};

export default systemParametersStore;
