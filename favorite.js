const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const friends = JSON.parse(localStorage.getItem('favoriteFriends')) || []
const FRIENDS_PER_PAGE = 12

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.img-show-friend')) {
    showFriendModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  setFriendList(getFriendByPage(page))
})

renderPaginator(friends.length ? friends.length : 1)
setFriendList(getFriendByPage(1))

function removeFromFavorite(id) {
  if (!friends) return

  //透過 id 找到要刪除電影的 index
  const friendIndex = friends.findIndex((friend) => friend.id === id)
  if (friendIndex === -1) return

  //刪除該筆電影
  friends.splice(friendIndex, 1)

  //存回 local storage
  localStorage.setItem('favoriteFriends', JSON.stringify(friends))

  //更新頁面
  const newIndex = friends[friendIndex] ? friendIndex : friendIndex - 1
  renderPaginator(friends.length ? friends.length : 1)
  setFriendList(getFriendByPage(Math.ceil((newIndex + 1) / FRIENDS_PER_PAGE)))
}

function setFriendList(data) {
  if (!data) return

  let rawHTML = ''
  data.forEach(value => {
    rawHTML += `
    <div class="col-sm-3">
      <img src="${value.avatar}" class="card-img-top img-show-friend" alt="Avatar" data-toggle="modal" data-target="#friend-modal" data-id="${value.id}">
      <h6>${value.name}</h6>
      <i class="fa fa-trash btn-remove-favorite" aria-hidden="true" data-id="${value.id}"></i>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showFriendModal(id) {
  const modalTitle = document.querySelector('#friend-modal-title')
  const modalInfo = document.querySelector('#friend-modal-info')
  const modalImage = document.querySelector('#friend-modal-image')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data
      modalTitle.innerText = data.name
      modalImage.innerHTML = `<img src="${data.avatar}" alt="Avatar">`
      modalInfo.innerHTML = ` 
      <ul>
        <li>surname:${data.surname}</li>
        <li>email:${data.email}</li>
        <li>gender:${data.gender}</li>
        <li>age:${data.age}</li>
        <li>region:${data.region}</li>
        <li>birthday:${data.birthday}</li>
      </ul>`
    })
}

function getFriendByPage(page) {
  //計算起始 index 
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
  //回傳切割後的新陣列
  return friends.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}

function renderPaginator(amount) {
  //計算總頁數
  console.log(amount)
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}
