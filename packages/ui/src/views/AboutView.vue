<template>
  <v-card
    class="mx-auto"
    width="400"
    prepend-icon="mdi-home"
  >
    <template v-slot:title>
      This is a title
    </template>

    <v-card-text>
      This is content
    </v-card-text>
  </v-card>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
