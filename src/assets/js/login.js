function loadLogin() {
  const signUpButton = document.getElementById("signUp");
  const signInButton = document.getElementById("signIn");
  const container = document.getElementById("container");

  signUpButton.addEventListener("click", () =>
    container.classList.add("right-panel-active")
  );

  signInButton.addEventListener("click", () =>
    container.classList.remove("right-panel-active")
  );

  //this is a challenge that was posted a while ago and I found a way arround it with somehelp from youtube; This is my code but not my idea.
}
