<template>
  <v-app style="max-width: 790px; margin: 0 auto; padding: 20px">
    <v-alert
      style="padding-top: 40px; padding-bottom: 40px; margin-bottom: 40px"
      type="warning"
      title="Remember"
      text="I have completed this Technical Assessment for FREE. Please note that certain aspects of the application may be less than ideal or exhibit some instability, as the focus has been on creating a Minimum Viable Product (MVP). I dedicated approximately 7 hours to the completion of this task. Thank you for your understanding."
    ></v-alert>
    <!--    Remember I did this task for Free, some aspect of application non-ideal -->
    <div class="error-container" v-if="state.isError">
      <div class="error-code">OOPS</div>
      <div class="error-text">something went wrong...</div>
      <p class="error-description">Please visit our website a little later</p>
    </div>

    <v-main v-else>
      <v-btn @click="state.isFavoritesModal = true"
        >show {{ state.favorites.length }} favorites
      </v-btn>

      <div class="page-search">
        <v-text-field
          label="Search a movie (min 3 symbols)"
          v-model="state.movieSearchText"
          :loading="state.isSearchLoading"
          @update:model-value="searchMovie"
        ></v-text-field>

        <v-btn height="56" @click="removeSearch">remove search</v-btn>
      </div>

      <div class="movies" v-show="state.isActiveMovieSearch">
        <template v-for="(page, pIndex) in state.pagesSearched">
          <card-movie
            v-for="movie in page"
            :key="movie.imdbID"
            :movie="movie"
            :index="pIndex"
            :current-searched-page="state.currentSearchedPage"
            :is-favorite="!state.favorites.includes(movie)"
            :style="{
              display: pIndex === state.currentSearchedPage - 1 ? 'flex' : 'none !important'
            }"
            @addFavorite="addFavorite"
            @removeFavorites="removeFavorites"
          />
        </template>
      </div>

      <v-pagination
        v-show="state.pagesSearched.length > 1"
        :length="state.pagesSearched.length"
        :model-value="state.currentSearchedPage"
        @update:model-value="toggleSearchedPage"
      />

      <v-dialog v-model="state.isFavoritesModal" max-width="500" style="padding: 20px">
        <v-card style="display: block; padding: 20px 20px 0">
          <p v-show="!state.favorites.length">You have not favorites for now</p>
          <card-movie
            v-for="movie in state.favorites"
            :key="movie.imdbID"
            :movie="movie"
            :current-searched-page="state.currentSearchedPage"
            :is-favorite="!state.favorites.includes(movie)"
            style="margin-top: 20px"
            @addFavorite="addFavorite"
            @removeFavorites="removeFavorites"
          />
          <v-card-actions style="margin-top: 20px">
            <v-btn color="primary" block @click="state.isFavoritesModal = false">Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <div class="movies" v-show="!state.isActiveMovieSearch">
        <v-skeleton-loader
          v-show="!state.pages[state.currentPage - 1]"
          class="movie-skeleton"
          v-for="i in 10"
          :key="i"
        ></v-skeleton-loader>
        <template v-for="(page, pIndex) in state.pages">
          <card-movie
            v-for="movie in page"
            :key="movie.imdbID"
            :style="{ display: pIndex === state.currentPage - 1 ? 'flex' : 'none !important' }"
            :movie="movie"
            :current-searched-page="state.currentSearchedPage"
            :is-favorite="!state.favorites.includes(movie)"
            @addFavorite="addFavorite"
            @removeFavorites="removeFavorites"
          />
        </template>
      </div>

      <div class="page-search" v-show="!state.isActiveMovieSearch">
        <v-text-field
          :label="`Enter a number from 1 to ${state.pages.length} to find a page`"
          type="number"
          v-model="state.pageSearchText"
        ></v-text-field>

        <v-btn height="56" @click="findPage">search</v-btn>
      </div>
      <v-pagination
        v-show="!state.isActiveMovieSearch"
        v-if="state.pages.length"
        :length="state.pages.length"
        :model-value="state.currentPage"
        @update:model-value="togglePage"
      />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
// https://jsonmock.hackerrank.com/api/movies/search/?Title=${title}&page=${page}
import { reactive } from 'vue';
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader';
import type { IMovie, IMoviesResponse } from '@/types';
import CardMovie from '@/components/card-movie.vue';

const state = reactive({
  pages: [] as IMovie[][],
  isError: false,
  currentPage: 1,
  pageSearchText: '',
  favorites: [] as IMovie[],
  isFavoritesModal: false,
  movieSearchText: '',
  isActiveMovieSearch: false,
  pagesSearched: [] as IMovie[][],
  isSearchLoading: false,
  currentSearchedPage: 1
});

getPage(1);

function togglePage(pageNumber: number) {
  getPage(pageNumber);
  state.currentPage = pageNumber;
}

async function getPage(pageNumber: number) {
  if (state.pages[pageNumber - 1]) return;
  try {
    const response = await fetch(
      `https://jsonmock.hackerrank.com/api/movies/search/?page=${pageNumber}`
    );
    const { page, data, total_pages } = (await response.json()) as IMoviesResponse;
    // Updating the page count with each fetch to handle potential discrepancies if the total number of pages changes.
    state.pages.length = total_pages;
    state.pages[page - 1] = data;
  } catch (e) {
    state.isError = true;
    console.error(e);
  }
}

function findPage() {
  const num = Number(state.pageSearchText);
  if (num > 0 && num < state.pages.length) {
    state.currentPage = num;
    getPage(num);
    state.pageSearchText = '';
  }
}

function addFavorite(ev: MouseEvent, movie: IMovie) {
  const res = state.favorites.includes(movie);
  if (!res) state.favorites.push(movie);
}

function removeFavorites(ev: MouseEvent, movie: IMovie) {
  const index = state.favorites.findIndex((el) => el === movie);
  state.favorites.splice(index, 1);
}

let timeout: ReturnType<typeof setTimeout>;
function searchMovie(title: string) {
  if (title.length < 3) {
    state.pagesSearched.length = 0;
    return;
  }
  state.pagesSearched.length = 0;
  state.isSearchLoading = true;
  state.isActiveMovieSearch = true;
  clearTimeout(timeout);

  timeout = setTimeout(async () => {
    const response = await fetch(
      `https://jsonmock.hackerrank.com/api/movies/search/?Title=${title}`
    );
    const { data, total_pages } = await response.json();
    state.pagesSearched.length = total_pages;
    if (total_pages > 0) state.pagesSearched[0] = data;
    state.isSearchLoading = false;
  }, 1000);
}

async function toggleSearchedPage(pageNumber: number) {
  state.currentSearchedPage = pageNumber;
  if (state.pagesSearched[pageNumber - 1]) return;
  try {
    const response = await fetch(
      `https://jsonmock.hackerrank.com/api/movies/search/
      ?Title=${state.movieSearchText}&page=${pageNumber}`
    );
    const { data, total_pages } = (await response.json()) as IMoviesResponse;
    // Updating the page count with each fetch to handle potential discrepancies if the total number of pages changes.
    state.pagesSearched.length = total_pages;
    state.pagesSearched[pageNumber - 1] = data;
  } catch (e) {
    state.isError = true;
    console.error(e);
  }
}

function removeSearch() {
  state.isActiveMovieSearch = false;
  state.movieSearchText = '';
  state.pagesSearched.length = 0;
  state.currentSearchedPage = 1;
}
</script>

<style scoped>
.movies {
  padding: 40px 0;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  grid-gap: 25px;
  justify-content: center;
}

.page-search {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 30px;
  justify-content: center;
  margin-top: 20px;
  @media screen and (max-width: 600px) {
    display: block;
  }
}

.error-container {
  text-align: center;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.error-code {
  font-size: 120px;
  font-weight: bold;
}

.error-text {
  font-size: 32px;
  margin: 0;
}

.error-description {
  color: #888;
  font-size: 18px;
  margin: 10px 0;
}
</style>
