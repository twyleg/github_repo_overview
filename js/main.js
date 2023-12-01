// Copyright (C) 2022 twyleg

function addListElement(headline, link, avatar_url, content, age) {
    var projectListElement = document.getElementById("project-list");

    var aElement = document.createElement("a");
    aElement.id = headline;
    aElement.className = "list-group-item list-group-item-action d-flex gap-3 py-3";
    aElement.setAttribute("aria-current", "true");
    aElement.setAttribute("href", link);

    var imgElement = document.createElement("img");
    imgElement.className = "rounded-circle flex-shrink-0";
    imgElement.setAttribute("src", avatar_url);
    imgElement.setAttribute("alt", "img");
    imgElement.setAttribute("width", "32");
    imgElement.setAttribute("height", "32");

    var layoutDivElement = document.createElement("div");
    layoutDivElement.className = "d-flex gap-2 w-100 justify-content-between";

    var containerDivElement = document.createElement("div");

    var h6Element = document.createElement("h6");
    h6Element.className = "mb-0";
    h6Element.innerHTML = headline;

    var pElement = document.createElement("p");
    pElement.className = "mb-0 opacity-75";
    pElement.innerHTML = content;

    var ageSmallElement = document.createElement("small");
    ageSmallElement.className = "opacity-50 text-nowrap";
    ageSmallElement.innerHTML = age;

    containerDivElement.appendChild(h6Element);
    containerDivElement.appendChild(pElement);

    layoutDivElement.appendChild(containerDivElement);
    layoutDivElement.appendChild(ageSmallElement);

    aElement.appendChild(imgElement);
    aElement.appendChild(layoutDivElement);

    projectListElement.appendChild(aElement);
}

function clearListElements() {
    var projectListElement = document.getElementById("project-list");
    projectListElement.replaceChildren();
}

function removeListElement(id) {
    var projectListElement = document.getElementById("project-list");
    var projectListEntryElement = projectListElement.querySelector('#'+id);
    projectListEntryElement.remove();
}


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getToken() {
  let token = getCookie("token");
  if (token == "") {
    token = prompt("Please enter your GitHub token (it will be saved locally in a cookie):", "");
    if (token != "" && token != null) {
      setCookie("token", token, 365);
    }
  }
  return token;
}

async function getProjects(token, reload = false) {

    var projects = [];
    var currentPage = 1;

    do {
        const response = await fetch("https://api.github.com/user/repos?" + new URLSearchParams({
            per_page: 100,
            sort: "full_name",
            page: currentPage++
        }).toString(), {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            cache: reload ? "reload" : "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": "Bearer " + token,
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        var newProjects = await response.json();
        console.log(newProjects);
        projects.push.apply(projects, newProjects);

    } while(newProjects.length);
    return projects;
}


async function getReposByOrg(token, org) {

    var repos = [];
    var currentPage = 1;

    do {
        const response = await fetch("https://api.github.com/orgs/" + org +"/repos?" + new URLSearchParams({
            per_page: 100,
            sort: "full_name",
            page: currentPage++
        }).toString(), {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": "Bearer " + token,
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        var newRepos = await response.json();
        repos.push.apply(repos, newRepos);

    } while(newRepos.length);
    return repos;
}


async function getOrgs(token) {

    const response = await fetch("https://api.github.com/user/orgs?" + new URLSearchParams({
        per_page: 100
    }).toString(), {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + token,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    let orgs = response.json();
    return orgs;

}

function getFilter() {
    let filterInputFieldElement = document.getElementById("filter-input-field");
    return filterInputFieldElement.value;
}

function getProjectAgeInDays(project) {
    let updatedTimestamp = Date.parse(project.pushed_at);
    let dt = Date.now() - updatedTimestamp;
    return Math.floor(dt / (1000 * 60 * 60 * 24));
}


async function showProjects(projects) {

    let filter = getFilter();
    clearListElements();

    for (const project of projects) {
        if (project.full_name.includes(filter)) {
            let projectAgeInDays = getProjectAgeInDays(project);
            addListElement(project.full_name, project.html_url, project.owner.avatar_url, project.description, projectAgeInDays+"d");
        }
    }
}

function setLoadingSpinnerVisibility(visible) {
    document.getElementById("loading-spinner").style.display = visible ? "inherit" : "none";
}


async function main() {

    let token = getToken();
    let projects = await getProjects(token, false);
    setLoadingSpinnerVisibility(false);
    showProjects(projects);

    var reloadButtonElement = document.getElementById("reload-button");
    reloadButtonElement.onclick = async function(){
        clearListElements();
        setLoadingSpinnerVisibility(true);
        projects = await getProjects(token, true);
        setLoadingSpinnerVisibility(false);
        showProjects(projects);
    };

    let timeOut;
    var filterInputFieldElement = document.getElementById("filter-input-field");
    filterInputFieldElement.oninput = function(){
        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
            showProjects(projects);
        }, 500)
    };
}


main();
