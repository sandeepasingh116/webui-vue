<template>
  <b-container fluid="xl">
    <page-title />
    <notices-text></notices-text>
  </b-container>
</template>

<script>
import NoticesText from './NoticesText';
import PageTitle from '@/components/Global/PageTitle';
export default {
  name: 'Notices',
  components: { NoticesText, PageTitle },
};
</script>
