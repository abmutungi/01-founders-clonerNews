const timeConverter = (UNIX_timestamp) => {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate() < 10 ? `0${a.getDate()}` : a.getDate();
  var hour = a.getHours() < 10 ? `0${a.getHours()}` : a.getHours();
  var min = a.getMinutes() < 10 ? `0${a.getMinutes()}` : a.getMinutes();
  var sec = a.getSeconds() < 10 ? `0${a.getSeconds()}` : a.getSeconds();
  var time = `${date} ${month} ${year} ${hour}:${min}:${sec}`;
  return time;
};
console.log(timeConverter(1656194839));

const displayComments = (kid) => {
  console.log(document.body);
  const parent = document.getElementById(kid.parent);

  const commentDiv = document.createElement("div");

  const commentContent = document.createElement("div");
  const commentAuthor = document.createElement("div");
  const commentBtn = document.createElement("button");

  const lenKids = kid.kids ? kid.kids.length : 0;

  commentBtn.textContent = `${lenKids} Comments`;

  commentDiv.id = kid.id;
  commentDiv.className = "story-div-class";

  if (kid.text) {
    commentContent.innerHTML = kid.text;
    commentContent.className = "content-class";
  }
  commentAuthor.innerHTML = `<span><b>@${kid.by}</b> ${timeConverter(
    kid.time
  )}</span>`;

  commentDiv.append(commentAuthor);
  commentDiv.append(commentContent);
  commentDiv.append(commentBtn);
  parent.append(commentDiv);

  commentBtn.addEventListener("click", (e) => {
    handleComments(kid.kids);
  });
};

const handleComments = (commentIds) => {
  const getCommentsData = async (commentIds) => {
    const sortedData = [...commentIds].sort((a, b) => (a > b ? -1 : 1));
    const showComments = await Promise.all([
      ...sortedData.map((commentId) =>
        fetch(
          `https://hacker-news.firebaseio.com/v0/item/${commentId}.json?print=pretty`
        ).then((showComment) => showComment.json())
      ),
    ]);
    return showComments;
  };
  getCommentsData(commentIds).then((showComments) => {
    showComments.forEach((comment) => {
      displayComments(comment);
    });
  });
};

const displayData = (story) => {
  console.log(story);
  const container = document.querySelector(".main-container-class");
  const storyDiv = document.createElement("div");
  const storyLink = document.createElement("a");
  const storyHead = document.createElement("h3");
  const storyContent = document.createElement("div");
  const storyAuthor = document.createElement("div");
  const storyComment = document.createElement("button");

  const lenKids = story.kids ? story.kids.length : 0;

  storyComment.textContent = `${lenKids} Comments`;

  storyDiv.id = story.id;
  storyDiv.className = "story-div-class";
  storyHead.textContent = story.title;
  if (story.url) {
    storyLink.href = story.url;
  }
  if (story.text) {
    storyContent.innerHTML = story.text;
    storyContent.className = "content-class";
  }
  storyAuthor.innerHTML = `<span><b>@${story.by}</b> ${timeConverter(
    story.time
  )}</span>`;
  storyLink.append(storyHead);
  storyDiv.append(storyLink);
  storyDiv.append(storyAuthor);
  storyDiv.append(storyContent);
  storyDiv.append(storyComment);
  container.append(storyDiv);

  storyComment.addEventListener("click", (e) => {
    handleComments(story.kids);
  });
};

const handleStories = (e) => {
  console.log(e.innerText);
  const getStoriesData = async () => {
    const showStoriesData = await fetch(
      e.innerText === "Stories"
        ? "https://hacker-news.firebaseio.com/v0/showstories.json?print=pretty"
        : "https://hacker-news.firebaseio.com/v0/jobstories.json?print=pretty"
    );
    const sData = await showStoriesData.json();
    const sortedData = [...sData].sort((a, b) => (a > b ? -1 : 1));
    const slicedData = sortedData.slice(0, 10);
    const showStories = await Promise.all([
      ...slicedData.map((storyId) =>
        fetch(
          `https://hacker-news.firebaseio.com/v0/item/${storyId}.json?print=pretty`
        ).then((showStory) => showStory.json())
      ),
    ]);
    return showStories;
  };
  getStoriesData().then((showStories) => {
    showStories.forEach((story) => {
      displayData(story);
    });

    // displayData(showStories);
  });
};

//start from the max level going backwards and skip the decendants, fetch 1000 at a time while counting the number of pool
// if the number of pool is less than fetch another 1000
const getPoll = ([[id, startId, maxId], count, polls]) => {
  let newId = id;
  let newStartId = startId;
  let newCount = count;
  let newPolls = polls ? polls : [];
  return fetch(
    `https://hacker-news.firebaseio.com/v0/item/${newId}.json?print=pretty`
  )
    .then((data) => data.json())
    .then((data) => {
      let fetchNewId;
      let fetchNewCount;
      let fetchNewPolls = newPolls ? [...newPolls] : [];
      if (data.type === "poll") {
        console.log(data, data.type === "poll");
        fetchNewPolls.push(data);
        console.log(fetchNewPolls);
        fetchNewCount = newCount + 1;
      }
      if (data.type !== "poll") {
        fetchNewCount = newCount;
        if (data.descendants) {
          fetchNewId = newId + data.descendants;
        }
      }
      fetchNewId = fetchNewId ? fetchNewId + 1 : newId + 1;
      let fetchNewStartId;
      if (fetchNewId === newStartId + 1000) {
        fetchNewStartId = newStartId - 1000;
        fetchNewId = fetchNewStartId;
      } else {
        fetchNewStartId = newStartId;
      }
      return [
        [fetchNewId, fetchNewStartId, maxId],
        fetchNewCount,
        fetchNewPolls,
      ];
    });
};
const handlePolls = () => {
  const magicLoop = (magicData) => {
    let [getPollData, count, polls] = magicData ? magicData : [[], 0, []];
    let newCount = count;
    if (newCount === 10) {
      return;
    }
    if (magicData !== undefined) {
      let newMagicData = magicData;
      getPoll(newMagicData).then((magicData) => {
        magicLoop(magicData);
      });
      return;
    }
    fetch(`https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty`)
      .then((max) => max.json())
      .then((max) => {
        maxId = max;
        return max;
      })
      .then((maxId) => {
        let startId = maxId - 1000;
        let id = startId;
        let newPolls = polls;
        return getPoll([[id, startId, maxId], newCount, newPolls])
          .then((getPollData) => {
            return getPollData;
          })
          .then((magicData) => {
            magicLoop(magicData);
          });
      });
    return;
  };

  magicLoop();
};
