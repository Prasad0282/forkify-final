import * as model from './model.js';

import { MODAL_CLOSE_SEC } from './views/config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookMarksView from './views/bookMarksView.js';
import addRecipeViews from './views/addRecipeViews.js';
import { async } from 'regenerator-runtime';
import 'regenerator-runtime/runtime';
import 'core-js/stable';

if (module.hot) {
  module.hot.accept();
}
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    //0)results view to mark search results
    resultsView.update(model.getSearchResultsPage());
    //1)update bookmarks
    bookMarksView.update(model.state.bookmarks);
    //1)loading recipe
    await model.loadRecipe(id);

    //2)rendering the recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSearchresults = async function () {
  try {
    resultsView.renderSpinner();
    //1}get search query
    const query = searchView.getQuery();
    if (!query) return;
    //2)clear search result
    await model.loadSearchResult(query);
    //3)render search result
    resultsView.render(model.getSearchResultsPage());
    //render buttons page
    paginationView.render(model.state.search);
    console.log(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  //render new results and buttons
  resultsView.render(model.getSearchResultsPage(goToPage));
  //render buttons page
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //1)get the new servings from view
  model.updateServings(newServings);

  //2)update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};
const controlAddBookmark = function () {
  ///1)add remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  //2) update recipeView
  recipeView.update(model.state.recipe);
  //3)render bookmarks
  bookMarksView.render(model.state.bookmarks);
};
const controlBookmark = function () {
  bookMarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeViews.renderSpinner();
    // Upload new data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    // Log to see if toggleWindow is called
    console.log('Form submitted, now closing...');
    //render recipe
    recipeView.render(model.state.recipe);
    //display message
    addRecipeViews.renderMessage();
    //render bookmark view
    bookMarksView.render(model.state.bookmarks);
    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Close the form window
    setTimeout(function () {
      addRecipeViews.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeViews.renderError(err.message);
  }
};

const init = function () {
  bookMarksView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchresults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeViews.addHandlerUpload(controlAddRecipe);
};
init();
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);
