<template>
  <div>
    <b-row>
      <b-col class="d-flex align-items-center justify-content-between">
        <dl class="mt-3 mr-3 w-75">
          <dt id="rpd-policy-label">
            {{ $t('pageSystemParameters.rpdPolicy') }}
          </dt>
          <dd id="rpd-policy-description">
            {{ $t('pageSystemParameters.rpdPolicyDescription') }}
          </dd>
        </dl>
      </b-col>
    </b-row>
    <b-row class="section-divider">
      <b-col md="8" xl="6">
        <b-form novalidate @submit.prevent="updateRpdPolicy">
          <b-select v-model="selectedOption" :options="options"></b-select>
          <b-button variant="primary" type="submit" class="mt-3 mb-3">
            {{ $t('pageSystemParameters.updateRpdPolicy') }}
          </b-button>
        </b-form>
      </b-col>
    </b-row>
    <b-row class="section-divider">
      <b-col class="d-flex align-items-center justify-content-between">
        <dl class="mt-3 mr-3 w-75">
          <dt id="immediate-test-requested-label">
            {{ $t('pageSystemParameters.immediateTestRequested') }}
          </dt>
          <dd id="immediate-test-requested-description">
            {{ $t('pageSystemParameters.immediateTestRequestedDescription') }}
          </dd>
        </dl>
        <b-form-checkbox
          id="immediateTestRequestedSwitch"
          v-model="immediateTestRequestedState"
          aria-labelledby="immediate-test-requested-label"
          aria-describedby="immediate-test-requested-description"
          switch
          :disabled="isRpdPolicy"
          @change="updateImmediateTestRequestedState"
        >
          <span v-if="immediateTestRequestedState">
            {{ $t('global.status.enabled') }}
          </span>
          <span v-else>{{ $t('global.status.disabled') }}</span>
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="d-flex align-items-center justify-content-between">
        <dl class="mt-3 mr-3 w-75">
          <dt id="rpd-scheduled-run-label">
            {{ $t('pageSystemParameters.rpdScheduledRun') }}
          </dt>
          <dd id="aggressive-prefetch-description">
            {{ $t('pageSystemParameters.rpdScheduledRunDescription') }}
          </dd>
        </dl>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="8" xl="6">
        <b-form @submit.prevent="updateRpdScheduledRun()">
          <b-form-group class="mb-2">
            <b-form-input
              id="input-rpd-scheduled-run"
              v-model.number="rpdScheduledRun"
              type="number"
              :min="0"
              :max="86399"
              :state="getValidationState($v.rpdScheduledRun)"
              :disabled="isRpdPolicy"
            ></b-form-input>
            <b-form-invalid-feedback role="alert">
              <template
                v-if="
                  !$v.rpdScheduledRun.minLength || !$v.rpdScheduledRun.maxLength
                "
              >
                {{
                  $t('global.form.valueMustBeBetween', {
                    min: 0,
                    max: 86399,
                  })
                }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
          <b-button
            variant="primary"
            type="submit"
            class="mt-2"
            :disabled="isRpdPolicy"
          >
            {{ $t('pageSystemParameters.updateRpdScheduledRun') }}
          </b-button>
        </b-form>
      </b-col>
    </b-row>
    <b-row class="section-divider mt-3"></b-row>
    <b-row>
      <b-col class="d-flex align-items-center justify-content-between">
        <dl class="mt-3 mr-3 w-75">
          <dt id="gard-on-error-label">
            {{ $t('pageSystemParameters.gardOnError') }}
          </dt>
          <dd id="gard-on-error-description">
            {{ $t('pageSystemParameters.gardOnErrorDescription') }}
          </dd>
        </dl>
        <b-form-checkbox
          id="gardOnErrorSwitch"
          v-model="gardOnErrorState"
          aria-labelledby="gard-on-error-label"
          aria-describedby="gard-on-error-description"
          switch
          :disabled="isRpdPolicy"
          @change="updateGardOnErrorState"
        >
          <span v-if="gardOnErrorState">
            {{ $t('global.status.enabled') }}
          </span>
          <span v-else>{{ $t('global.status.disabled') }}</span>
        </b-form-checkbox>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import { mapGetters } from 'vuex';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { minValue, maxValue } from 'vuelidate/lib/validators';

export default {
  name: 'RuntimeProcessorDiagnostic',
  mixins: [LoadingBarMixin, BVToastMixin, PageSection, VuelidateMixin],
  props: {
    safeMode: {
      type: Boolean,
      default: null,
    },
  },
  computed: {
    ...mapGetters('systemParameters', ['rpdPolicy', 'rpdPolicyOptions']),
    selectedOption: {
      get() {
        return this.rpdPolicy;
      },
      set(value) {
        // Do something when the option is selected
        // e.g. update the value in the store
        this.$store.commit('systemParameters/setRpdPolicy', value);
      },
    },
    isRpdPolicy() {
      return this.selectedOption === 'Disabled' ? true : false;
    },
    options() {
      return this.rpdPolicyOptions.map((option) => ({
        value: option,
        text: option,
      }));
    },
    aggressivePrefetchState: {
      get() {
        return this.$store.getters['systemParameters/aggressivePrefetch'];
      },
      set(newValue) {
        return newValue;
      },
    },
    immediateTestRequestedState: {
      get() {
        return this.$store.getters['systemParameters/immediateTestRequested'];
      },
      set(newValue) {
        return newValue;
      },
    },
    rpdScheduledRun: {
      get() {
        return this.$store.getters['systemParameters/rpdScheduledRun'];
      },
      set(value) {
        this.$v.$touch();
        this.$store.commit('systemParameters/setRpdScheduledRun', value);
      },
    },
    gardOnErrorState: {
      get() {
        return this.$store.getters['systemParameters/gardOnError'];
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  validations() {
    return {
      rpdScheduledRun: {
        minValue: minValue(0),
        maxValue: maxValue(86399),
      },
    };
  },
  watch: {
    selectedItem: function (newValue) {
      this.$store.dispatch('systemParameters/setRpdPolicy', newValue);
    },
  },
  methods: {
    updateImmediateTestRequestedState(state) {
      this.startLoader();
      this.$store
        .dispatch('systemParameters/saveImmediateTestRequested', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    updateGardOnErrorState(state) {
      this.$store
        .dispatch('systemParameters/saveGardOnError', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    updateRpdPolicy() {
      this.startLoader();
      let rpdPolicyValue = this.selectedOption;
      this.$store
        .dispatch('systemParameters/saveRpdPolicy', rpdPolicyValue)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    updateRpdScheduledRun() {
      this.startLoader();
      this.$store
        .dispatch('systemParameters/saveRpdScheduledRun')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
  },
};
</script>
