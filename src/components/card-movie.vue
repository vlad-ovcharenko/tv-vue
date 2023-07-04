<template>
  <v-card
    :href="`https://www.imdb.com/title/${movie.imdbID}`"
    class="movie"
    target="_blank"
  >
    <v-card-title class="movie__title">{{ movie.Title }}</v-card-title>
    <v-card-subtitle class="year">{{ movie.Year }}</v-card-subtitle>
    <v-card-actions>
      <v-btn v-show="isFavorite" @click.prevent="$emit('addFavorite', $event, movie)"
        >Add to Favorites
      </v-btn>
      <v-btn v-show="!isFavorite" @click.prevent="$emit('removeFavorites', $event, movie)">
        remove from favorites
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { IMovie } from '@/types';

const props = defineProps<{
  movie: IMovie;
  isFavorite: boolean;
  currentSearchedPage: number;
}>();
</script>

<style>
.movie {
  display: flex !important;
  flex-direction: column;
}

.movie__title {
  white-space: normal !important;
  flex-grow: 1 !important;
}
</style>