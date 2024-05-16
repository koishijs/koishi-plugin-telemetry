<template>
  <div class="k-card t8-oob">
  </div>
</template>

<style lang="scss">

.page-home .t8-oob {
  --t8-oob-title: 2.5rem;
  --t8-oob-gap: 2rem;

  height: calc(100vh - var(--header-height) - var(--footer-height) - var(--card-margin) - var(--card-margin));

  margin: var(--card-margin);

  h1 {
    font-size: var(--t8-oob-title);
    margin-top: 0;
  }

  h1 + p {
    margin: var(--t8-oob-gap) 0;
  }

  @media screen and (max-width: 768px) {
    --t8-oob-title: 2rem;
    --t8-oob-gap: 1.5rem;
  }
}

</style>
