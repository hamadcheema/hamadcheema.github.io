// js/components/header.js

export function renderHeader(currentUser, navigate) {
    const headerEl = document.querySelector('.header-content');
    if (!headerEl) return;

    headerEl.innerHTML = `
        <a href="#home" class="logo" data-route="home">FirebaseInsta</a>
        <div class="nav-icons">
            <button class="icon-button" data-route="home"><i class="fas fa-home"></i></button>
            <button class="icon-button" data-route="chat"><i class="fas fa-paper-plane"></i></button>
            <button class="icon-button" data-route="upload"><i class="fas fa-plus-square"></i></button>
            <button class="icon-button" data-route="explore"><i class="fas fa-compass"></i></button>
            <button class="icon-button" data-route="activity"><i class="fas fa-heart"></i></button>
            <button class="profile-button" data-route="profile" data-uid="${currentUser?.uid}">
                ${currentUser?.profile?.profilePictureBase64 ?
                    `<img src="${currentUser.profile.profile
