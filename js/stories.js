"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const isFavorite = currentUser.favorites.some(
    (fav) => fav.storyId === story.storyId
  );
  const favoriteClass = isFavorite ? "fas fa-star" : "far fa-star";
  const showDeleteBtn = currentUser && story.username === currentUser.username;
  const deleteBtnHTML = showDeleteBtn
    ? `<span class="delete-btn">🗑️</span>`
    : "";

  return $(`
      <li id="${story.storyId}">
     
        <span class="star"><i class="${favoriteClass}"></i></span>
        <a href="${story.url}" target="_blank" class="story-link">${story.title}</a>
        ${deleteBtnHTML}
        <small class="story-hostname">(${hostName})</small> <br></br>
       
        <p class="story-author">by ${story.author}</p>
        <p class="story-user">posted by ${story.username}</p>
        
      </li>
  `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function handleStorySubmit(evt) {
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  const newStory = await storyList.addStory(currentUser, {
    title,
    author,
    url,
  });

  $("#story-form").trigger("reset");
  $("#story-form-section").addClass("hidden");
}

$("#story-form").on("submit", handleStorySubmit);

$("#all-stories-list").on("click", ".star", async function (evt) {
  const storyId = $(this).closest("li").attr("id");
  const isFavorited = $(this).find("i").hasClass("fas");

  if (isFavorited) {
    await currentUser.removeFavorite(storyId);
  } else {
    await currentUser.addFavorite(storyId);
  }

  $(this).find("i").toggleClass("fas far");
});

$("#all-stories-list").on("click", ".delete-btn", async function (e) {
  e.stopPropagation();
  const $li = $(this).closest("li");
  const storyId = $li.attr("id");

  await storyList.removeStory(currentUser, storyId);
  $li.remove();
});

async function displayFavorites() {
  await currentUser.retrieveDetails();
  $("#favorite-stories-list").empty();
  currentUser.favorites.forEach((story) => {
    const markup = generateStoryMarkup(story);
    $("#favorite-stories-list").append(markup);
  });
}
