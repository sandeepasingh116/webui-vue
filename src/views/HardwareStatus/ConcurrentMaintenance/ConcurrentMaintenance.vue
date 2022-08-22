<template>
  <b-container fluid="xl">
    <b-row>
      <b-col md="8" xl="8">
        <page-title />
      </b-col>
    </b-row>
    <b-row>
      <b-col md="8" xl="6">
        <alert variant="info" class="mb-4">
          <div class="font-weight-bold">
            {{ $t('pageConcurrentMaintenance.alert.title') }}
          </div>
          <div>
            {{ $t('pageConcurrentMaintenance.alert.message') }}
          </div>
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="8" class="d-flex align-items-center justify-content-between">
        <dl class="mr-3">
          <dt>
            {{ $t('pageConcurrentMaintenance.tod') }}
          </dt>
          <dd>
            <b-form-checkbox
              id="batteryyy"
              v-model="readyToRemoveState"
              switch
              @change="changeReadyToRemoveState"
            >
              <span v-if="readyToRemoveState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import Alert from '@/components/Global/Alert';

export default {
  name: 'ConcurrentMaintenance',
  components: { PageTitle, Alert },
  mixins: [LoadingBarMixin, BVToastMixin],
  computed: {
    readyToRemoveState: {
      get() {
        return this.$store.getters['concurrent/readyToRemove'];
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('concurrent/getReadyToRemove')
      .finally(() => this.endLoader());
  },
  methods: {
    changeReadyToRemoveState(state) {
      this.$store
        .dispatch('concurrent/saveReadyToRemoveState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
