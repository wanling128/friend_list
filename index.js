const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const searchSubmit = document.querySelector('#search-submit')
const searchSelect = document.querySelector('#search-select')

const friends = []
let filteredFriends = []
const FRIENDS_PER_PAGE = 12
let currentPage = 1
let totalPage = 1

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.img-show-friend')) {
    showFriendModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  const data = filteredFriends.length ? filteredFriends : friends

  //取得頁數
  if (event.target.matches('.prior-page')) {
    currentPage = currentPage === 1 ? currentPage : currentPage - 1
  } else if (event.target.matches('.next-page')) {
    currentPage = currentPage === totalPage ? currentPage : currentPage + 1
  } else {
    //透過 dataset 取得被點擊的頁數
    currentPage = Number(event.target.dataset.page)
  }

  //更新畫面
  setPaginator(data.length)
  setFriendList(getFriendByPage(currentPage))
})

searchForm.addEventListener('click', function onSearchFormClicked(event) {
  if (event.target.tagName === 'BUTTON') {
    //因為submit會觸發重整頁面·所以要利用preventDefault取消預設的功能
    event.preventDefault()

    const keyword = searchInput.value.trim().toUpperCase()
    const selectOption = searchSelect.value

    //條件篩選
    filteredFriends = friends.filter((friend) =>
      friend[selectOption].toUpperCase().includes(keyword))

    //錯誤處理：無符合條件的結果
    if (filteredFriends.length === 0) {
      return alert(`您輸入的關鍵字：${searchInput.value.trim()} 沒有符合條件的人`)
    }

    //預設顯示第 1 頁的搜尋結果
    currentPage = 1
    //重新輸出至畫面
    setPaginator(filteredFriends.length)
    setFriendList(getFriendByPage(currentPage))
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results)
    setPaginator(friends.length)
    setFriendList(getFriendByPage(1))
  })
  .catch((err) => {
    console.log(err)
    backupData()
  })

function setFriendList(data) {
  let rawHTML = ''
  data.forEach(value => {
    rawHTML += `
    <div class="col-sm-3">
      <img src="${value.avatar}" class="card-img-top img-show-friend" alt="Avatar" data-toggle="modal" data-target="#friend-modal" data-id="${value.id}">
      <h6>${value.name}</h6>
      <i class="fa fa-heart btn-add-favorite" aria-hidden="true" data-id="${value.id}"></i>
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

function setPaginator(amount) {
  //計算頁數
  totalPage = Math.ceil(amount / FRIENDS_PER_PAGE)
  const pageBegin = currentPage < 3 || totalPage < 5 ? 1
    : currentPage > totalPage - 2 ? totalPage - 4
      : currentPage - 2
  const pageEnd = pageBegin > totalPage - 4 ? totalPage : pageBegin + 4

  let rawHTML = `
    <li class="page-item">
      <a class="page-link prior-page" href="#" aria-label="Previous">&laquo;</a>
    </li>`
  for (let i = pageBegin; i <= pageEnd; i++) {
    rawHTML += `
    <li class="page-item">
      <a class="page-link" href="#" data-page="${i}">${i}</a>
    </li>`
  }
  rawHTML += `     
    <li class="page-item">
      <a class="page-link next-page" href="#" aria-label="Next">&raquo;</a>
    </li>`

  paginator.innerHTML = rawHTML
  paginator.children[currentPage - pageBegin + 1].classList.add('active')
}

function getFriendByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  const friend = friends.find((friend) => friend.id === id)
  if (list.some((friend) => friend.id === id)) {
    return alert('此人已經在收藏清單中！')
  }
  list.push(friend)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}











//因連線常常不穩，備用一個資料庫
function backupData() {
  let testInfo = [
    {
      "id": 601,
      "name": "Guillaume",
      "surname": "Vincent",
      "email": "guillaume.vincent@example.com",
      "gender": "male",
      "age": 25,
      "region": "CH",
      "birthday": "1995-05-05",
      "avatar": "https://randomuser.me/api/portraits/men/88.jpg",
      "created_at": "2020-04-01T09:37:57.270Z",
      "updated_at": "2020-04-01T09:37:57.270Z"
    },
    { "id": 602, "name": "Vanessa", "surname": "Davis", "email": "vanessa.davis@example.com", "gender": "female", "age": 33, "region": "AU", "birthday": "1987-08-08", "avatar": "https://randomuser.me/api/portraits/women/17.jpg", "created_at": "2020-04-01T09:37:57.321Z", "updated_at": "2020-04-01T09:37:57.321Z" }, { "id": 603, "name": "Justine", "surname": "Smith", "email": "justine.smith@example.com", "gender": "female", "age": 53, "region": "CA", "birthday": "1967-11-13", "avatar": "https://randomuser.me/api/portraits/women/21.jpg", "created_at": "2020-04-01T09:37:57.366Z", "updated_at": "2020-04-01T09:37:57.366Z" }, { "id": 604, "name": "Zbigniew", "surname": "Gleich", "email": "zbigniew.gleich@example.com", "gender": "male", "age": 45, "region": "DE", "birthday": "1975-10-13", "avatar": "https://randomuser.me/api/portraits/men/4.jpg", "created_at": "2020-04-01T09:37:57.410Z", "updated_at": "2020-04-01T09:37:57.410Z" }, { "id": 605, "name": "Elias", "surname": "Silva", "email": "elias.silva@example.com", "gender": "male", "age": 31, "region": "BR", "birthday": "1989-12-05", "avatar": "https://randomuser.me/api/portraits/men/11.jpg", "created_at": "2020-04-01T09:37:57.446Z", "updated_at": "2020-04-01T09:37:57.446Z" }, { "id": 606, "name": "Anna-Marie", "surname": "Kretschmann", "email": "anna-marie.kretschmann@example.com", "gender": "female", "age": 22, "region": "DE", "birthday": "1998-04-10", "avatar": "https://randomuser.me/api/portraits/women/78.jpg", "created_at": "2020-04-01T09:37:57.524Z", "updated_at": "2020-04-01T09:37:57.524Z" }, { "id": 607, "name": "Dominic", "surname": "Dupont", "email": "dominic.dupont@example.com", "gender": "male", "age": 63, "region": "CH", "birthday": "1957-06-29", "avatar": "https://randomuser.me/api/portraits/men/12.jpg", "created_at": "2020-04-01T09:37:57.575Z", "updated_at": "2020-04-01T09:37:57.575Z" }, { "id": 608, "name": "Mae", "surname": "Robinson", "email": "mae.robinson@example.com", "gender": "female", "age": 36, "region": "US", "birthday": "1984-11-29", "avatar": "https://randomuser.me/api/portraits/women/72.jpg", "created_at": "2020-04-01T09:37:57.621Z", "updated_at": "2020-04-01T09:37:57.621Z" }]
  friends.push(...testInfo)
  setFriendList(friends)
}