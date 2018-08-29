<template>
  <div class="container main text-center page404">
    <h4 class="blue">................. ERROR 404 ................. <span class="yellow" style="font-size:3em">OOPS!</span><div class="d-lg-none d-xl-none"></div>................. ERROR 404 .................</h4>
		<h4 ><img class="img404" src="@/assets/img/404.png"/>&emsp;Судя по всему, что-то пошло не так!&emsp;<img class="img404" src="@/assets/img/404.png"/></h4>
		<h4 >Попробуйте:</h4>
		<h4><a href="#" @click="window.history.back();">- вернуться назад -</a></h4>
		<h4><a href="/Profile">- перейти в свой профиль -</a></h4>
		<h4><a href="/">- выйти из сети -</a></h4>
		<br>
		<h4 >Также, вы можете:</h4>
		<h4><a href="https://www.youtube.com/watch?v=VsDpw6PQGg0">- напиться -</a></h4>
		<h4><a href="https://www.youtube.com/watch?v=gkTb9GP9lVI">- пойти погулять -</a></h4>
		<h4><a href="https://www.youtube.com/watch?v=6UHlXLmsDGA">- рыдать -</a></h4>
  </div>
</template>

<style scoped lang="scss">
img {
  image-rendering: pixelated;
  width: 50px;
}

h4 {
  color: #FFF7B2;
}

h4 a {
  color: #0098DA;
}

.blue {
  color: #0098DA !important;
}
</style>