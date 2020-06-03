const DEFAULT_PICTURE = "http://placehold.it/100x100";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.headers.post["Content-Type"] = "application/json";

//getting recipes from JSON
function getRecipes() {
  return axios.get("/recipes");
}

//function of adding recipe
function addRecipe(data) {
  return axios.post("/recipes", { ...{}, ...data });
}

//delete recipe with confirmation
function deleteRecipe(id) {
  return axios.delete(`/recipes/${id}`);
}

//function to make short information about recipe
function createAboutRecipe(recipe) {
  const $aboutRecipe = $(`
    <li class="media mb-4">
        <img src="${
          recipe.picture || DEFAULT_PICTURE
        }" class="align-self-center mr-3" alt="..." width="150px" height="100px">
        <div class="media-body">
            <h5 id='title' class="mt-0 mb-1">${recipe.title}</h5>
            <p id='about'>${recipe.about}</p>
            <small id="ingredients" class="text-muted">Ingredients: ${
              recipe.ingredients
            }</small>
        </div>
    </li>`);

  $aboutRecipe.find("#title").on("click", (e) => {
    showRecipe(recipe);
  });

  return $aboutRecipe;
}

let recipeCollection = [];

//function to show short information about recipe in a list
function showAboutRecipe(recipe) {
  const $aboutRecipe = createAboutRecipe(recipe);
  $aboutRecipe.appendTo($("#recipes-list"));

  recipeCollection.push($aboutRecipe);
  return $aboutRecipe;
}

//function to show the full information about recipe with variants to delete, edit, or go back
function showRecipe(recipe) {
  const id = recipe.id;
  const $recipe = $(`<div><h2>${recipe.title}</h2>
  <img src="${
    recipe.picture || DEFAULT_PICTURE
  }" class="align-self-center mr-3" alt="..." width="150px" height="100px">
    <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
    <p><strong>Description: </strong>${recipe.recipe}</p>
    <button class='btn btn-primari' id="go-back">Go back</button>
    <button id='edit' type="button" class="btn btn-primari">Edit</button>
    <button class='btn btn-secondary' id="delete" >Delete recipe</button>
    <div>`);

  $("#recipes-container").hide();

  $recipe.find("#go-back").on("click", (e) => {
    $("#recipes-container").show();
    $recipe.detach();
  });

  //function to edit the recipe
  $recipe.find("#edit").on("click", (e) => {
    $modal.modal("toggle");
    let editTitle = $modal.find("#title");
    editTitle.val(recipe.title);
    let editRecipe = $modal.find("#recipe");
    editRecipe.val(recipe.recipe);
    let editIngredients = $modal.find("#ingredients");
    editIngredients.val(recipe.ingredients);
    let editPicture = $modal.find("#picture");
    editPicture.val(recipe.picture);

    $modal.find("#save").on("click", (e) => {
      axios
        .put(`/recipes/${id}`, {
          title: $modal.find("#title").val(),
          recipe: $modal.find("#recipe").val(),
          about: recipe.about,
          ingredients: $modal.find("#ingredients").val(),
          picture: $modal.find("#picture").val(),
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(err);
        });

      $modal.modal("toggle");
    });
  });

  $recipe.find("#delete").on("click", (e) => {
    $("#recipes-container").show();
    deleteRecipe(recipe.id);
    $recipe.detach();
  });

  $recipe.appendTo($(".container"));
}

//modal for adding and editing the recipe
const $modal = $(`<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Please fill in the information</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
        <form>
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" class="form-control" id="title">
          </div>
        <div class="form-group">
          <label for="recipe">Recipe</label>
          <textarea rows='5' class="form-control" id="recipe"></textarea>
        </div>

        <div class="form-group">
        <label for="ingredients">Ingredients</label>
        <input type="text" class="form-control" id="ingredients">
        </div>

        <div class="form-group">
        <label for="picture">Insert the link on the picture</label>
        <input type="text" class="form-control" id="picture">
        </div>
      </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button id='save' type="button" class="btn btn-primari">Save changes</button>
          
        </div>
      </div>
    </div>
  </div>`);

function showModal() {
  $modal.appendTo("body");
  $modal.modal("toggle");
  $modal.on("hidden.bs.modal", () => {
    $modal.detach();
  });

  $modal.find("#save").on("click", (e) => {
    const title = $modal.find("#title").val();
    const recipe = $modal.find("#recipe").val();
    const ingredients = $modal.find("#ingredients").val();
    const picture = $modal.find("#picture").val();
    const about = recipe.slice(0, 30);

    addRecipe({ title, recipe, ingredients, picture, about }).then((resp) => {
      if (resp.data) {
        resp.data.forEach((recipe) => {
          showRecipe(recipe);
        });
      } else {
        alert("No data!");
      }
    });
    $modal.modal("toggle");
  });
}

$(document).ready(() => {
  getRecipes()
    .then((resp) => {
      if (resp.data) {
        resp.data.forEach((recipe) => {
          showAboutRecipe(recipe);
        });
      } else {
        alert("No data!");
      }
    })
    .catch((error) => {
      alert("Error");
      console.log(error);
    });

  $("#add-recipe").on("click", (e) => {
    showModal();
  });
});

//searching by name and ingredients
const $serachInput = $("#searchInput");
const $searchInputIngredients = $("#searchInputIngredients");

function onSearchClick(event) {
  const searchVal = $serachInput.val().toLowerCase().trim();
  recipeCollection.forEach(($recipe) => {
    let titleKey = $recipe.find("#title")[0].innerText.toLowerCase();
    if (titleKey.includes(searchVal)) {
      $recipe.show();
    } else {
      $recipe.hide();
    }
  });
}
function onSearchIngrClick(event) {
  const searchIngrVal = $searchInputIngredients.val().toLowerCase().trim();
  recipeCollection.forEach(($recipe) => {
    let titleKeyIng = $recipe.find("#ingredients")[0].innerText.toLowerCase();
    if (titleKeyIng.includes(searchIngrVal)) {
      $recipe.show();
    } else {
      $recipe.hide();
    }
  });
}
$serachInput.on("keyup", onSearchClick);
$searchInputIngredients.on("keyup", onSearchIngrClick);
